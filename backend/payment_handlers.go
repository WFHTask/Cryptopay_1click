package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// CreatePaymentWithAuthRequest 带API Key的支付请求
type CreatePaymentWithAuthRequest struct {
	APIKey      string  `json:"api_key" binding:"required"`
	OrderID     string  `json:"order_id" binding:"required"`
	Amount      float64 `json:"amount" binding:"required,gt=0"`
	NotifyURL   string  `json:"notify_url"`
	RedirectURL string  `json:"redirect_url"`
	Description string  `json:"description"`
}

func (r *CreatePaymentWithAuthRequest) GetNotifyURL() string {
	if r.NotifyURL == "" {
		return getEnvOrDefault("NOTIFY_URL", "http://backend:8080/api/payment/callback")
	}
	return r.NotifyURL
}

func (r *CreatePaymentWithAuthRequest) GetRedirectURL() string {
	if r.RedirectURL == "" {
		return getEnvOrDefault("REDIRECT_URL", "http://localhost:3000/payment/success")
	}
	return r.RedirectURL
}

// CreatePaymentWithAuth 使用API Key创建支付
func CreatePaymentWithAuth(c *gin.Context) {
	var req CreatePaymentWithAuthRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误: " + err.Error()})
		return
	}

	// 验证API Key
	var merchant Merchant
	if err := DB.Where("api_key = ? AND status = 1", req.APIKey).First(&merchant).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "无效的API Key"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "查询失败"})
		return
	}

	// 获取商户的钱包地址
	var wallets []MerchantWallet
	if err := DB.Where("merchant_id = ? AND status = 1", merchant.ID).Find(&wallets).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "查询钱包失败"})
		return
	}

	if len(wallets) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "商户尚未配置钱包地址"})
		return
	}

	// 获取Epusdt API Token用于签名
	epusdtAPIToken := getEnvOrDefault("EPUSDT_API_TOKEN", "123456")
	notifyURL := req.GetNotifyURL()
	redirectURL := req.GetRedirectURL()

	// 调用Epusdt创建支付
	epusdtReq := EpusdtCreateRequest{
		OrderID:     req.OrderID,
		Amount:      req.Amount,
		NotifyURL:   notifyURL,
		RedirectURL: redirectURL,
		Signature: generateSignature(map[string]interface{}{
			"order_id":     req.OrderID,
			"amount":       req.Amount,
			"notify_url":   notifyURL,
			"redirect_url": redirectURL,
		}, epusdtAPIToken),
	}

	jsonData, err := json.Marshal(epusdtReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建请求失败"})
		return
	}

	epusdtURL := getEnvOrDefault("EPUSDT_URL", "http://epusdt:8000")
	resp, err := http.Post(
		epusdtURL+"/api/v1/order/create-transaction",
		"application/json",
		bytes.NewBuffer(jsonData),
	)
	if err != nil {
		log.Printf("Failed to call epusdt: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "调用支付服务失败"})
		return
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "读取响应失败"})
		return
	}

	var epusdtResp EpusdtResponse
	if err := json.Unmarshal(body, &epusdtResp); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "解析响应失败"})
		return
	}

	if epusdtResp.StatusCode != 200 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":       epusdtResp.Message,
			"status_code": epusdtResp.StatusCode,
		})
		return
	}

	// 保存订单到数据库
	order := Order{
		MerchantID:   &merchant.ID,
		TradeID:      epusdtResp.Data.TradeID,
		OrderID:      epusdtResp.Data.OrderID,
		Amount:       epusdtResp.Data.Amount,
		ActualAmount: epusdtResp.Data.ActualAmount,
		Token:        epusdtResp.Data.Token,
		Status:       1,
		NotifyURL:    notifyURL,
		RedirectURL:  redirectURL,
	}

	if err := DB.Create(&order).Error; err != nil {
		log.Printf("Failed to save order: %v", err)
	}

	// 生成嵌入式支付URL
	embedURL := fmt.Sprintf("%s/embed/payment/%s?order_id=%s&amount=%.2f&actual_amount=%.4f&wallet_address=%s&expiration_time=%d",
		getEnvOrDefault("FRONTEND_URL", "http://localhost:3000"),
		epusdtResp.Data.TradeID,
		epusdtResp.Data.OrderID,
		epusdtResp.Data.Amount,
		epusdtResp.Data.ActualAmount,
		epusdtResp.Data.Token,
		epusdtResp.Data.ExpirationTime,
	)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"trade_id":        epusdtResp.Data.TradeID,
			"order_id":        epusdtResp.Data.OrderID,
			"amount":          epusdtResp.Data.Amount,
			"actual_amount":   epusdtResp.Data.ActualAmount,
			"wallet_address":  epusdtResp.Data.Token,
			"expiration_time": epusdtResp.Data.ExpirationTime,
			"payment_url":     epusdtResp.Data.PaymentURL,
			"embed_url":       embedURL,
			"iframe_code":     fmt.Sprintf(`<iframe src="%s" width="450" height="650" frameborder="0" scrolling="no" style="border: 2px solid rgba(0,255,159,0.3); border-radius: 12px;"></iframe>`, embedURL),
		},
	})
}

// GetStatistics 获取商户统计数据
func GetStatistics(c *gin.Context) {
	merchantID, _ := c.Get("merchant_id")

	// 查询统计数据
	var stats struct {
		TotalOrders   int64   `json:"total_orders"`
		SuccessOrders int64   `json:"success_orders"`
		TotalAmount   float64 `json:"total_amount"`
		SuccessAmount float64 `json:"success_amount"`
	}

	// 总订单数
	DB.Model(&Order{}).Where("merchant_id = ?", merchantID).Count(&stats.TotalOrders)

	// 成功订单数
	DB.Model(&Order{}).Where("merchant_id = ? AND status = 2", merchantID).Count(&stats.SuccessOrders)

	// 总金额
	DB.Model(&Order{}).Where("merchant_id = ?", merchantID).Select("COALESCE(SUM(amount), 0)").Scan(&stats.TotalAmount)

	// 成功金额
	DB.Model(&Order{}).Where("merchant_id = ? AND status = 2", merchantID).Select("COALESCE(SUM(amount), 0)").Scan(&stats.SuccessAmount)

	// 今日统计
	today := time.Now().Format("2006-01-02")
	var todayStats struct {
		TodayOrders  int64   `json:"today_orders"`
		TodaySuccess int64   `json:"today_success"`
		TodayAmount  float64 `json:"today_amount"`
	}

	DB.Model(&Order{}).Where("merchant_id = ? AND DATE(created_at) = ?", merchantID, today).Count(&todayStats.TodayOrders)
	DB.Model(&Order{}).Where("merchant_id = ? AND status = 2 AND DATE(created_at) = ?", merchantID, today).Count(&todayStats.TodaySuccess)
	DB.Model(&Order{}).Where("merchant_id = ? AND DATE(created_at) = ?", merchantID, today).Select("COALESCE(SUM(amount), 0)").Scan(&todayStats.TodayAmount)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"total": stats,
			"today": todayStats,
		},
	})
}
