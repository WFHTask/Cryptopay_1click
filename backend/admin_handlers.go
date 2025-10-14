package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// GetAllMerchants 获取所有商户列表（管理员）
func GetAllMerchants(c *gin.Context) {
	var merchants []Merchant
	if err := DB.Find(&merchants).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "查询失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    merchants,
	})
}

// GetAllOrders 获取所有订单（管理员）
func GetAllOrders(c *gin.Context) {
	var orders []Order
	page := atoi(c.DefaultQuery("page", "1"))
	pageSize := atoi(c.DefaultQuery("page_size", "50"))

	var total int64
	DB.Model(&Order{}).Count(&total)

	if err := DB.Preload("Merchant").
		Order("created_at DESC").
		Limit(pageSize).
		Offset((page - 1) * pageSize).
		Find(&orders).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "查询失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"orders": orders,
			"total":  total,
			"page":   page,
		},
	})
}

// GetAllWallets 获取所有钱包（管理员）
func GetAllWallets(c *gin.Context) {
	var wallets []MerchantWallet
	if err := DB.Find(&wallets).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "查询失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    wallets,
	})
}

// GetSystemStatistics 获取系统统计（管理员）
func GetSystemStatistics(c *gin.Context) {
	var stats struct {
		TotalMerchants int64   `json:"total_merchants"`
		TotalOrders    int64   `json:"total_orders"`
		SuccessOrders  int64   `json:"success_orders"`
		TotalAmount    float64 `json:"total_amount"`
		SuccessAmount  float64 `json:"success_amount"`
		TotalWallets   int64   `json:"total_wallets"`
	}

	// 商户数
	DB.Model(&Merchant{}).Count(&stats.TotalMerchants)

	// 钱包数
	DB.Model(&MerchantWallet{}).Count(&stats.TotalWallets)

	// 订单数
	DB.Model(&Order{}).Count(&stats.TotalOrders)
	DB.Model(&Order{}).Where("status = 2").Count(&stats.SuccessOrders)

	// 金额统计
	DB.Model(&Order{}).Select("COALESCE(SUM(amount), 0)").Scan(&stats.TotalAmount)
	DB.Model(&Order{}).Where("status = 2").Select("COALESCE(SUM(amount), 0)").Scan(&stats.SuccessAmount)

	// 按商户统计
	type MerchantStat struct {
		MerchantID    uint    `json:"merchant_id"`
		Username      string  `json:"username"`
		OrderCount    int64   `json:"order_count"`
		SuccessCount  int64   `json:"success_count"`
		TotalAmount   float64 `json:"total_amount"`
		SuccessAmount float64 `json:"success_amount"`
	}

	var merchantStats []MerchantStat
	DB.Raw(`
		SELECT 
			m.id as merchant_id,
			m.username,
			COUNT(o.id) as order_count,
			SUM(CASE WHEN o.status = 2 THEN 1 ELSE 0 END) as success_count,
			COALESCE(SUM(o.amount), 0) as total_amount,
			COALESCE(SUM(CASE WHEN o.status = 2 THEN o.amount ELSE 0 END), 0) as success_amount
		FROM merchants m
		LEFT JOIN orders o ON o.merchant_id = m.id
		WHERE m.role = 'merchant'
		GROUP BY m.id, m.username
		ORDER BY total_amount DESC
		LIMIT 10
	`).Scan(&merchantStats)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"system":    stats,
			"merchants": merchantStats,
		},
	})
}

// UpdateMerchantStatus 更新商户状态（管理员）
func UpdateMerchantStatus(c *gin.Context) {
	merchantID := c.Param("id")
	var req struct {
		Status int `json:"status" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误"})
		return
	}

	if err := DB.Model(&Merchant{}).Where("id = ?", merchantID).Update("status", req.Status).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "更新失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "状态更新成功",
	})
}
