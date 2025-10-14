package main

import (
	"bytes"
	"crypto/md5"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"sort"
	"strings"

	"github.com/gin-gonic/gin"
)

// CreatePaymentRequest 创建支付请求
type CreatePaymentRequest struct {
	OrderID     string  `json:"order_id" binding:"required"`
	Amount      float64 `json:"amount" binding:"required,gt=0"`
	Description string  `json:"description"`
}

// EpusdtCreateRequest Epusdt创建交易请求
type EpusdtCreateRequest struct {
	OrderID     string  `json:"order_id"`
	Amount      float64 `json:"amount"`
	NotifyURL   string  `json:"notify_url"`
	RedirectURL string  `json:"redirect_url"`
	Signature   string  `json:"signature"`
}

// EpusdtResponse Epusdt响应
type EpusdtResponse struct {
	StatusCode int    `json:"status_code"`
	Message    string `json:"message"`
	Data       struct {
		TradeID        string  `json:"trade_id"`
		OrderID        string  `json:"order_id"`
		Amount         float64 `json:"amount"`
		ActualAmount   float64 `json:"actual_amount"`
		Token          string  `json:"token"`
		ExpirationTime int64   `json:"expiration_time"`
		PaymentURL     string  `json:"payment_url"`
	} `json:"data"`
	RequestID string `json:"request_id"`
}

// PaymentCallbackRequest 支付回调请求
type PaymentCallbackRequest struct {
	TradeID            string  `json:"trade_id"`
	OrderID            string  `json:"order_id"`
	Amount             float64 `json:"amount"`
	ActualAmount       float64 `json:"actual_amount"`
	Token              string  `json:"token"`
	BlockTransactionID string  `json:"block_transaction_id"`
	Signature          string  `json:"signature"`
	Status             int     `json:"status"`
}

// 生成签名
func generateSignature(params map[string]interface{}, apiToken string) string {
	// 提取所有非空参数并排序
	var keys []string
	for k, v := range params {
		if v != "" && v != nil && k != "signature" {
			keys = append(keys, k)
		}
	}
	sort.Strings(keys)

	// 构建签名字符串
	var signStr strings.Builder
	for i, k := range keys {
		if i > 0 {
			signStr.WriteString("&")
		}
		signStr.WriteString(fmt.Sprintf("%s=%v", k, params[k]))
	}
	signStr.WriteString(apiToken)

	// MD5加密
	hash := md5.Sum([]byte(signStr.String()))
	return hex.EncodeToString(hash[:])
}

// 验证签名
func verifySignature(params map[string]interface{}, signature string, apiToken string) bool {
	expectedSignature := generateSignature(params, apiToken)
	return expectedSignature == signature
}

// CreatePayment 创建支付订单
func CreatePayment(c *gin.Context) {
	var req CreatePaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "参数错误: " + err.Error(),
		})
		return
	}

	// 获取环境变量
	epusdtURL := os.Getenv("EPUSDT_URL")
	apiToken := os.Getenv("EPUSDT_API_TOKEN")
	notifyURL := os.Getenv("NOTIFY_URL")
	redirectURL := os.Getenv("REDIRECT_URL")

	if epusdtURL == "" || apiToken == "" {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "服务配置错误",
		})
		return
	}

	// 构建请求参数
	params := map[string]interface{}{
		"order_id":     req.OrderID,
		"amount":       req.Amount,
		"notify_url":   notifyURL,
		"redirect_url": redirectURL,
	}

	// 生成签名
	signature := generateSignature(params, apiToken)

	epusdtReq := EpusdtCreateRequest{
		OrderID:     req.OrderID,
		Amount:      req.Amount,
		NotifyURL:   notifyURL,
		RedirectURL: redirectURL,
		Signature:   signature,
	}

	// 发送请求到Epusdt
	jsonData, err := json.Marshal(epusdtReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "创建请求失败",
		})
		return
	}

	resp, err := http.Post(
		epusdtURL+"/api/v1/order/create-transaction",
		"application/json",
		bytes.NewBuffer(jsonData),
	)
	if err != nil {
		log.Printf("Failed to call epusdt: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "调用支付服务失败",
		})
		return
	}
	defer resp.Body.Close()

	// 读取响应
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "读取响应失败",
		})
		return
	}

	var epusdtResp EpusdtResponse
	if err := json.Unmarshal(body, &epusdtResp); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "解析响应失败",
		})
		return
	}

	if epusdtResp.StatusCode != 200 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":       epusdtResp.Message,
			"status_code": epusdtResp.StatusCode,
		})
		return
	}

	// 返回成功响应
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
		},
	})
}

// QueryPayment 查询支付订单状态
func QueryPayment(c *gin.Context) {
	orderID := c.Param("order_id")

	// 这里可以实现查询逻辑，连接数据库或调用epusdt的查询接口
	// 简化示例，返回模拟数据
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"order_id": orderID,
			"status":   "pending", // pending, success, expired
		},
	})
}

// PaymentCallback 接收Epusdt的支付回调
func PaymentCallback(c *gin.Context) {
	var callback PaymentCallbackRequest
	if err := c.ShouldBindJSON(&callback); err != nil {
		log.Printf("Failed to parse callback: %v", err)
		c.String(http.StatusBadRequest, "error")
		return
	}

	// 验证签名
	apiToken := os.Getenv("EPUSDT_API_TOKEN")
	params := map[string]interface{}{
		"trade_id":             callback.TradeID,
		"order_id":             callback.OrderID,
		"amount":               callback.Amount,
		"actual_amount":        callback.ActualAmount,
		"token":                callback.Token,
		"block_transaction_id": callback.BlockTransactionID,
		"status":               callback.Status,
	}

	if !verifySignature(params, callback.Signature, apiToken) {
		log.Printf("Invalid signature for order: %s", callback.OrderID)
		c.String(http.StatusUnauthorized, "error")
		return
	}

	// 处理支付结果
	log.Printf("Payment callback received: OrderID=%s, Status=%d, Amount=%.2f, ActualAmount=%.4f",
		callback.OrderID, callback.Status, callback.Amount, callback.ActualAmount)

	// 这里应该：
	// 1. 更新数据库中的订单状态
	// 2. 执行业务逻辑（如发货、开通服务等）
	// 3. 发送通知给用户

	// 根据status处理不同状态
	switch callback.Status {
	case 1:
		log.Printf("Order %s is waiting for payment", callback.OrderID)
	case 2:
		log.Printf("Order %s payment successful! TxID: %s", callback.OrderID, callback.BlockTransactionID)
		// TODO: 执行支付成功后的业务逻辑
	case 3:
		log.Printf("Order %s has expired", callback.OrderID)
	}

	// 返回"ok"告诉epusdt回调成功
	c.String(http.StatusOK, "ok")
}
