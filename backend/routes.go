package main

import (
	"github.com/gin-gonic/gin"
)

func RegisterRoutes(r *gin.Engine) {
	api := r.Group("/api")
	{
		// 公开接口
		auth := api.Group("/auth")
		{
			auth.POST("/register", Register)
			auth.POST("/login", Login)
		}

		// 支付相关接口（公开，通过API Key认证）
		payment := api.Group("/payment")
		{
			payment.POST("/create", CreatePaymentWithAuth)
			payment.GET("/query/:order_id", QueryPayment)
			payment.POST("/callback", PaymentCallback)
		}

		// 需要JWT认证的商户接口
		merchant := api.Group("/merchant")
		merchant.Use(AuthMiddleware())
		{
			merchant.GET("/profile", GetProfile)
			merchant.GET("/wallets", GetWallets)
			merchant.POST("/wallets", AddWallet)
			merchant.DELETE("/wallets/:id", DeleteWallet)
			merchant.GET("/orders", GetOrders)
			merchant.GET("/statistics", GetStatistics)
		}

		// 管理员专用接口（需要管理员权限）
		admin := api.Group("/admin")
		admin.Use(AuthMiddleware(), AdminMiddleware())
		{
			admin.GET("/merchants", GetAllMerchants)
			admin.GET("/orders", GetAllOrders)
			admin.GET("/wallets", GetAllWallets)
			admin.GET("/statistics", GetSystemStatistics)
			admin.PUT("/merchants/:id/status", UpdateMerchantStatus)
		}

		// 健康检查
		api.GET("/health", func(c *gin.Context) {
			c.JSON(200, gin.H{"status": "ok"})
		})
	}
}
