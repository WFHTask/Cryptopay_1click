package service

import (
	"payment-link-mvp/internal/model"
	"time"

	"gorm.io/gorm"
)

type AdminService struct {
	db            *gorm.DB
	epusdtService *EpusdtService
}

func NewAdminService(db *gorm.DB, epusdtService *EpusdtService) *AdminService {
	return &AdminService{
		db:            db,
		epusdtService: epusdtService,
	}
}

// 用户管理相关结构体
type UserListResponse struct {
	Users []model.User `json:"users"`
	Total int64        `json:"total"`
}

type UserUpdateRequest struct {
	Name  string `json:"name"`
	Email string `json:"email"`
	Role  string `json:"role"`
}

// 订单管理相关结构体
type OrderListResponse struct {
	Orders []model.PaymentOrder `json:"orders"`
	Total  int64                `json:"total"`
}

type OrderUpdateRequest struct {
	Status string `json:"status"`
}

// 统计信息结构体
type DashboardStats struct {
	TotalUsers      int64   `json:"total_users"`
	TotalOrders     int64   `json:"total_orders"`
	TotalRevenue    float64 `json:"total_revenue"`
	PendingOrders   int64   `json:"pending_orders"`
	CompletedOrders int64   `json:"completed_orders"`
	FailedOrders    int64   `json:"failed_orders"`

	// 时间维度统计
	TodayStats    TimeStats `json:"today_stats"`
	WeekStats     TimeStats `json:"week_stats"`
	MonthStats    TimeStats `json:"month_stats"`
}

// 时间维度统计结构体
type TimeStats struct {
	Orders  int64   `json:"orders"`
	Revenue float64 `json:"revenue"`
}

// 获取所有用户列表
func (s *AdminService) GetAllUsers(page, pageSize int) (*UserListResponse, error) {
	var users []model.User
	var total int64

	// 获取总数
	if err := s.db.Model(&model.User{}).Count(&total).Error; err != nil {
		return nil, err
	}

	// 分页查询
	offset := (page - 1) * pageSize
	if err := s.db.Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&users).Error; err != nil {
		return nil, err
	}

	return &UserListResponse{
		Users: users,
		Total: total,
	}, nil
}

// 获取单个用户详情
func (s *AdminService) GetUserByID(userID uint) (*model.User, error) {
	var user model.User
	if err := s.db.First(&user, userID).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

// 更新用户信息
func (s *AdminService) UpdateUser(userID uint, req UserUpdateRequest) error {
	updates := make(map[string]interface{})

	if req.Name != "" {
		updates["name"] = req.Name
	}
	if req.Email != "" {
		updates["email"] = req.Email
	}
	if req.Role != "" {
		updates["role"] = req.Role
	}

	updates["updated_at"] = time.Now()

	return s.db.Model(&model.User{}).Where("id = ?", userID).Updates(updates).Error
}

// 删除用户
func (s *AdminService) DeleteUser(userID uint) error {
	return s.db.Delete(&model.User{}, userID).Error
}

// 获取所有订单列表
func (s *AdminService) GetAllOrders(page, pageSize int) (*OrderListResponse, error) {
	var orders []model.PaymentOrder
	var total int64

	// 获取总数
	if err := s.db.Model(&model.PaymentOrder{}).Count(&total).Error; err != nil {
		return nil, err
	}

	// 分页查询，包含关联的支付链接和用户信息
	offset := (page - 1) * pageSize
	if err := s.db.Preload("PaymentLink.User").Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&orders).Error; err != nil {
		return nil, err
	}

	return &OrderListResponse{
		Orders: orders,
		Total:  total,
	}, nil
}

// 获取单个订单详情
func (s *AdminService) GetOrderByID(orderID uint) (*model.PaymentOrder, error) {
	var order model.PaymentOrder
	if err := s.db.Preload("PaymentLink.User").First(&order, orderID).Error; err != nil {
		return nil, err
	}
	return &order, nil
}

// 更新订单状态
func (s *AdminService) UpdateOrderStatus(orderID uint, req OrderUpdateRequest) error {
	updates := map[string]interface{}{
		"status":     req.Status,
		"updated_at": time.Now(),
	}

	return s.db.Model(&model.PaymentOrder{}).Where("id = ?", orderID).Updates(updates).Error
}

// 删除订单
func (s *AdminService) DeleteOrder(orderID uint) error {
	return s.db.Delete(&model.PaymentOrder{}, orderID).Error
}

// 获取仪表板统计信息
func (s *AdminService) GetDashboardStats() (*DashboardStats, error) {
	var stats DashboardStats

	// 总用户数
	if err := s.db.Model(&model.User{}).Count(&stats.TotalUsers).Error; err != nil {
		return nil, err
	}

	// 总订单数
	if err := s.db.Model(&model.PaymentOrder{}).Count(&stats.TotalOrders).Error; err != nil {
		return nil, err
	}

	// 总收入（已完成的订单）
	if err := s.db.Model(&model.PaymentOrder{}).Where("status = ?", "paid").Select("COALESCE(SUM(actual_amount), 0)").Scan(&stats.TotalRevenue).Error; err != nil {
		return nil, err
	}

	// 待处理订单数
	if err := s.db.Model(&model.PaymentOrder{}).Where("status = ?", "pending").Count(&stats.PendingOrders).Error; err != nil {
		return nil, err
	}

	// 已完成订单数
	if err := s.db.Model(&model.PaymentOrder{}).Where("status = ?", "paid").Count(&stats.CompletedOrders).Error; err != nil {
		return nil, err
	}

	// 失败订单数
	if err := s.db.Model(&model.PaymentOrder{}).Where("status = ?", "expired").Count(&stats.FailedOrders).Error; err != nil {
		return nil, err
	}

	// 获取时间维度统计
	now := time.Now()

	// 今日统计
	todayStart := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	if err := s.db.Model(&model.PaymentOrder{}).Where("created_at >= ?", todayStart).Count(&stats.TodayStats.Orders).Error; err != nil {
		return nil, err
	}
	if err := s.db.Model(&model.PaymentOrder{}).Where("status = ? AND created_at >= ?", "paid", todayStart).Select("COALESCE(SUM(actual_amount), 0)").Scan(&stats.TodayStats.Revenue).Error; err != nil {
		return nil, err
	}

	// 本周统计
	weekStart := todayStart.AddDate(0, 0, -int(now.Weekday()))
	if err := s.db.Model(&model.PaymentOrder{}).Where("created_at >= ?", weekStart).Count(&stats.WeekStats.Orders).Error; err != nil {
		return nil, err
	}
	if err := s.db.Model(&model.PaymentOrder{}).Where("status = ? AND created_at >= ?", "paid", weekStart).Select("COALESCE(SUM(actual_amount), 0)").Scan(&stats.WeekStats.Revenue).Error; err != nil {
		return nil, err
	}

	// 本月统计
	monthStart := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
	if err := s.db.Model(&model.PaymentOrder{}).Where("created_at >= ?", monthStart).Count(&stats.MonthStats.Orders).Error; err != nil {
		return nil, err
	}
	if err := s.db.Model(&model.PaymentOrder{}).Where("status = ? AND created_at >= ?", "paid", monthStart).Select("COALESCE(SUM(actual_amount), 0)").Scan(&stats.MonthStats.Revenue).Error; err != nil {
		return nil, err
	}

	return &stats, nil
}

// 搜索用户
func (s *AdminService) SearchUsers(query string, page, pageSize int) (*UserListResponse, error) {
	var users []model.User
	var total int64

	// 构建搜索条件
	searchQuery := s.db.Where("name LIKE ? OR email LIKE ?", "%"+query+"%", "%"+query+"%")

	// 获取总数
	if err := searchQuery.Model(&model.User{}).Count(&total).Error; err != nil {
		return nil, err
	}

	// 分页查询
	offset := (page - 1) * pageSize
	if err := searchQuery.Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&users).Error; err != nil {
		return nil, err
	}

	return &UserListResponse{
		Users: users,
		Total: total,
	}, nil
}

// 搜索订单
func (s *AdminService) SearchOrders(query string, page, pageSize int) (*OrderListResponse, error) {
	var orders []model.PaymentOrder
	var total int64

	// 构建搜索条件
	searchQuery := s.db.Where("trade_id LIKE ? OR order_id LIKE ?", "%"+query+"%", "%"+query+"%")

	// 获取总数
	if err := searchQuery.Model(&model.PaymentOrder{}).Count(&total).Error; err != nil {
		return nil, err
	}

	// 分页查询
	offset := (page - 1) * pageSize
	if err := searchQuery.Preload("PaymentLink.User").Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&orders).Error; err != nil {
		return nil, err
	}

	return &OrderListResponse{
		Orders: orders,
		Total:  total,
	}, nil
}

// GetWalletAddresses 获取所有钱包地址
func (s *AdminService) GetWalletAddresses() ([]string, error) {
	return s.epusdtService.GetWalletAddresses()
}

// AddWalletAddress 添加钱包地址
func (s *AdminService) AddWalletAddress(walletAddress string) error {
	return s.epusdtService.AddWalletAddress(walletAddress)
}
