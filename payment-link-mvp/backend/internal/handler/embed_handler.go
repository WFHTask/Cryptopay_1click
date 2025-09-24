package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"payment-link-mvp/internal/service"
)

type EmbedHandler struct {
	paymentLinkService *service.PaymentLinkService
	userService        *service.UserService
}

func NewEmbedHandler(paymentLinkService *service.PaymentLinkService, userService *service.UserService) *EmbedHandler {
	return &EmbedHandler{
		paymentLinkService: paymentLinkService,
		userService:        userService,
	}
}

// 嵌入式支付链接创建请求
type EmbedPaymentLinkRequest struct {
	Title       string                 `json:"title" binding:"required"`
	Amount      float64                `json:"amount" binding:"required,min=0.01"`
	Currency    string                 `json:"currency"`
	Description string                 `json:"description"`
	CallbackURL string                 `json:"callback_url"`
	SuccessURL  string                 `json:"success_url"`
	CancelURL   string                 `json:"cancel_url"`
	Metadata    map[string]interface{} `json:"metadata"`
}

// API Key认证中间件
func (h *EmbedHandler) APIKeyAuth() gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		apiKey := c.GetHeader("X-API-Key")
		if apiKey == "" {
			// 也检查Bearer token格式
			authHeader := c.GetHeader("Authorization")
			if len(authHeader) > 7 && authHeader[:7] == "Bearer " {
				apiKey = authHeader[7:]
			}
		}

		if apiKey == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "API Key is required",
				"code":  "MISSING_API_KEY",
			})
			c.Abort()
			return
		}

		// 通过API Key查找用户
		user, err := h.userService.GetUserByAPIKey(apiKey)
		if err != nil || user == nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid API Key",
				"code":  "INVALID_API_KEY",
			})
			c.Abort()
			return
		}

		// 将用户信息存储在上下文中
		c.Set("user", user)
		c.Next()
	})
}

// 创建嵌入式支付链接
func (h *EmbedHandler) CreateEmbedPaymentLink(c *gin.Context) {
	var req EmbedPaymentLinkRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request format",
			"code":  "INVALID_REQUEST",
			"details": err.Error(),
		})
		return
	}

	// 从上下文获取用户信息
	user := c.MustGet("user").(*service.UserResponse)

	// 设置默认值
	if req.Currency == "" {
		req.Currency = "USDT"
	}

	// 创建支付链接
	createReq := service.CreatePaymentLinkRequest{
		Title:       req.Title,
		Amount:      req.Amount,
		Description: req.Description,
		CallbackURL: req.CallbackURL,
		Currency:    req.Currency,
	}

	paymentLink, err := h.paymentLinkService.Create(user.ID, &createReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create payment link",
			"code":  "CREATION_FAILED",
			"details": err.Error(),
		})
		return
	}

	// 生成嵌入相关的URL
	baseURL := "http://47.109.140.124:3000" // 可以从配置获取
	embedURL := baseURL + "/embed/pay/" + paymentLink.LinkID
	paymentURL := baseURL + "/pay/" + paymentLink.LinkID

	// 返回嵌入所需的完整信息
	response := gin.H{
		"success": true,
		"payment_link": gin.H{
			"id":          paymentLink.ID,
			"link_id":     paymentLink.LinkID,
			"title":       paymentLink.Title,
			"amount":      paymentLink.Amount,
			"currency":    paymentLink.Currency,
			"description": paymentLink.Description,
			"status":      paymentLink.Status,
			"created_at":  paymentLink.CreatedAt,
			"expires_at":  paymentLink.UpdatedAt, // 可以添加过期时间逻辑
		},
		"urls": gin.H{
			"payment_url": paymentURL,
			"embed_url":   embedURL,
		},
		"embed_code": gin.H{
			"html": `<iframe src="` + embedURL + `" width="400" height="600" frameborder="0"></iframe>`,
			"javascript": `
<script src="` + baseURL + `/usdt-pay-sdk.js"></script>
<script>
  USDTPaySDK.init({
    apiKey: '` + user.APIKey + `',
    amount: ` + strconv.FormatFloat(req.Amount, 'f', -1, 64) + `,
    title: '` + req.Title + `',
    description: '` + req.Description + `',
    onSuccess: function(data) {
      console.log('Payment successful:', data);
      // 处理支付成功
    },
    onError: function(error) {
      console.log('Payment failed:', error);
      // 处理支付失败
    }
  });
</script>`,
		},
		"metadata": req.Metadata,
	}

	c.JSON(http.StatusOK, response)
}

// 获取支付链接状态（无需认证）
func (h *EmbedHandler) GetPaymentLinkStatus(c *gin.Context) {
	linkID := c.Param("linkId")
	if linkID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Link ID is required",
			"code":  "MISSING_LINK_ID",
		})
		return
	}

	paymentLink, err := h.paymentLinkService.GetByLinkID(linkID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Payment link not found",
			"code":  "LINK_NOT_FOUND",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"payment_link": gin.H{
			"id":          paymentLink.ID,
			"link_id":     paymentLink.LinkID,
			"title":       paymentLink.Title,
			"amount":      paymentLink.Amount,
			"currency":    paymentLink.Currency,
			"description": paymentLink.Description,
			"status":      paymentLink.Status,
			"created_at":  paymentLink.CreatedAt,
			"updated_at":  paymentLink.UpdatedAt,
		},
	})
}