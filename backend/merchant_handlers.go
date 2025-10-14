package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// RegisterRequest 注册请求
type RegisterRequest struct {
	Username string `json:"username" binding:"required,min=3,max=50"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

// LoginRequest 登录请求
type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// AddWalletRequest 添加钱包请求
type AddWalletRequest struct {
	WalletAddress string `json:"wallet_address" binding:"required"`
	WalletName    string `json:"wallet_name"`
}

// Register 商户注册
func Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误: " + err.Error()})
		return
	}

	// 检查用户名是否已存在
	var existingMerchant Merchant
	if err := DB.Where("username = ?", req.Username).First(&existingMerchant).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "用户名已存在"})
		return
	}

	// 检查邮箱是否已存在
	if err := DB.Where("email = ?", req.Email).First(&existingMerchant).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "邮箱已被使用"})
		return
	}

	// 加密密码
	hashedPassword, err := HashPassword(req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "密码加密失败"})
		return
	}

	// 生成API密钥
	apiKey, err := GenerateAPIKey()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "API密钥生成失败"})
		return
	}

	apiSecret, err := GenerateAPIKey()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "API密钥生成失败"})
		return
	}

	// 创建商户
	merchant := Merchant{
		Username:  req.Username,
		Email:     req.Email,
		Password:  hashedPassword,
		APIKey:    apiKey,
		APISecret: apiSecret,
		Status:    1,
	}

	if err := DB.Create(&merchant).Error; err != nil {
		log.Printf("Failed to create merchant: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建商户失败"})
		return
	}

	// 生成JWT令牌
	token, err := GenerateToken(merchant.ID, merchant.Username, merchant.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "生成令牌失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "注册成功",
		"data": gin.H{
			"merchant_id": merchant.ID,
			"username":    merchant.Username,
			"email":       merchant.Email,
			"api_key":     merchant.APIKey,
			"api_secret":  merchant.APISecret,
			"role":        merchant.Role,
			"token":       token,
		},
	})
}

// Login 商户登录
func Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误: " + err.Error()})
		return
	}

	// 查找商户
	var merchant Merchant
	if err := DB.Where("username = ?", req.Username).First(&merchant).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "用户名或密码错误"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "查询失败"})
		return
	}

	// 验证密码
	if !CheckPassword(req.Password, merchant.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "用户名或密码错误"})
		return
	}

	// 检查账户状态
	if merchant.Status != 1 {
		c.JSON(http.StatusForbidden, gin.H{"error": "账户已被禁用"})
		return
	}

	// 生成JWT令牌
	token, err := GenerateToken(merchant.ID, merchant.Username, merchant.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "生成令牌失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "登录成功",
		"data": gin.H{
			"merchant_id": merchant.ID,
			"username":    merchant.Username,
			"email":       merchant.Email,
			"api_key":     merchant.APIKey,
			"role":        merchant.Role,
			"token":       token,
		},
	})
}

// GetProfile 获取商户信息
func GetProfile(c *gin.Context) {
	merchantID, _ := c.Get("merchant_id")

	var merchant Merchant
	if err := DB.First(&merchant, merchantID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "商户不存在"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    merchant,
	})
}

// GetWallets 获取商户钱包列表
func GetWallets(c *gin.Context) {
	merchantID, _ := c.Get("merchant_id")

	var wallets []MerchantWallet
	if err := DB.Where("merchant_id = ?", merchantID).Find(&wallets).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "查询失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    wallets,
	})
}

// AddWallet 添加钱包地址
func AddWallet(c *gin.Context) {
	merchantID, _ := c.Get("merchant_id")

	var req AddWalletRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误: " + err.Error()})
		return
	}

	// 检查钱包地址是否已存在
	var existingWallet MerchantWallet
	if err := DB.Where("wallet_address = ?", req.WalletAddress).First(&existingWallet).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "该钱包地址已被使用"})
		return
	}

	// 同时添加到 wallet_address 表（兼容epusdt）
	result := DB.Exec("INSERT INTO wallet_address (token, status, created_at, updated_at) VALUES (?, 1, NOW(), NOW())", req.WalletAddress)
	if result.Error != nil {
		log.Printf("Failed to add to wallet_address: %v", result.Error)
	}

	// 创建商户钱包
	wallet := MerchantWallet{
		MerchantID:    merchantID.(uint),
		WalletAddress: req.WalletAddress,
		WalletName:    req.WalletName,
		Status:        1,
	}

	if err := DB.Create(&wallet).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "添加钱包失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "添加钱包成功",
		"data":    wallet,
	})
}

// DeleteWallet 删除钱包地址
func DeleteWallet(c *gin.Context) {
	merchantID, _ := c.Get("merchant_id")
	walletID := c.Param("id")

	var wallet MerchantWallet
	if err := DB.Where("id = ? AND merchant_id = ?", walletID, merchantID).First(&wallet).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "钱包不存在"})
		return
	}

	// 从 wallet_address 表中删除
	DB.Exec("UPDATE wallet_address SET deleted_at = NOW() WHERE token = ?", wallet.WalletAddress)

	// 软删除商户钱包
	if err := DB.Delete(&wallet).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "删除失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "删除成功",
	})
}

// GetOrders 获取商户订单列表
func GetOrders(c *gin.Context) {
	merchantID, _ := c.Get("merchant_id")

	var orders []Order
	query := DB.Where("merchant_id = ?", merchantID)

	// 支持分页
	page := c.DefaultQuery("page", "1")
	pageSize := c.DefaultQuery("page_size", "20")

	var total int64
	query.Model(&Order{}).Count(&total)

	if err := query.Order("created_at DESC").Limit(atoi(pageSize)).Offset((atoi(page) - 1) * atoi(pageSize)).Find(&orders).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "查询失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"orders": orders,
			"total":  total,
			"page":   atoi(page),
		},
	})
}

func atoi(s string) int {
	var i int
	fmt.Sscanf(s, "%d", &i)
	return i
}
