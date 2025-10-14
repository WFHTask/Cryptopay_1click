package main

import (
	"time"

	"gorm.io/gorm"
)

// Merchant 商户模型
type Merchant struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	Username  string         `gorm:"unique;not null" json:"username"`
	Email     string         `gorm:"unique;not null" json:"email"`
	Password  string         `gorm:"not null" json:"-"` // 不在JSON中返回
	APIKey    string         `gorm:"unique;not null" json:"api_key"`
	APISecret string         `gorm:"not null" json:"-"` // 不在JSON中返回
	Status    int            `gorm:"default:1" json:"status"`
	Role      string         `gorm:"default:merchant" json:"role"` // 角色：admin, merchant
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// MerchantWallet 商户钱包模型
type MerchantWallet struct {
	ID            uint           `gorm:"primarykey" json:"id"`
	MerchantID    uint           `gorm:"not null;index" json:"merchant_id"`
	WalletAddress string         `gorm:"unique;not null" json:"wallet_address"`
	WalletName    string         `json:"wallet_name"`
	Status        int            `gorm:"default:1" json:"status"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
}

// Order 订单模型
type Order struct {
	ID           uint      `gorm:"primarykey" json:"id"`
	MerchantID   *uint     `gorm:"index" json:"merchant_id"`
	TradeID      string    `json:"trade_id"`
	OrderID      string    `json:"order_id"`
	Amount       float64   `json:"amount"`
	ActualAmount float64   `json:"actual_amount"`
	Token        string    `json:"token"`
	Status       int       `json:"status"`
	NotifyURL    string    `json:"notify_url"`
	RedirectURL  string    `json:"redirect_url"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

func (Merchant) TableName() string {
	return "merchants"
}

func (MerchantWallet) TableName() string {
	return "merchant_wallets"
}

func (Order) TableName() string {
	return "orders"
}
