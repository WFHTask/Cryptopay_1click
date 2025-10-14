-- 创建商户用户表
CREATE TABLE IF NOT EXISTS `merchants` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '商户ID',
  `username` varchar(50) NOT NULL COMMENT '用户名',
  `email` varchar(100) NOT NULL COMMENT '邮箱',
  `password` varchar(255) NOT NULL COMMENT '密码（bcrypt加密）',
  `api_key` varchar(64) NOT NULL COMMENT 'API密钥',
  `api_secret` varchar(64) NOT NULL COMMENT 'API密钥Secret',
  `status` tinyint NOT NULL DEFAULT '1' COMMENT '状态：0-禁用，1-启用',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` timestamp NULL DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  UNIQUE KEY `uk_email` (`email`),
  UNIQUE KEY `uk_api_key` (`api_key`),
  KEY `idx_status` (`status`),
  KEY `idx_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商户表';

-- 创建商户钱包地址表
CREATE TABLE IF NOT EXISTS `merchant_wallets` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '钱包ID',
  `merchant_id` int NOT NULL COMMENT '商户ID',
  `wallet_address` varchar(50) NOT NULL COMMENT 'USDT TRC20钱包地址',
  `wallet_name` varchar(100) DEFAULT NULL COMMENT '钱包名称',
  `status` tinyint NOT NULL DEFAULT '1' COMMENT '状态：0-禁用，1-启用',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` timestamp NULL DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_wallet_address` (`wallet_address`),
  KEY `idx_merchant_id` (`merchant_id`),
  KEY `idx_status` (`status`),
  KEY `idx_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_merchant_wallets_merchant_id` FOREIGN KEY (`merchant_id`) REFERENCES `merchants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商户钱包地址表';

-- 修改订单表，添加商户ID字段
ALTER TABLE `orders` 
ADD COLUMN `merchant_id` int DEFAULT NULL COMMENT '商户ID' AFTER `id`,
ADD INDEX `idx_merchant_id` (`merchant_id`);

-- 创建会话表（用于JWT刷新令牌）
CREATE TABLE IF NOT EXISTS `merchant_sessions` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '会话ID',
  `merchant_id` int NOT NULL COMMENT '商户ID',
  `refresh_token` varchar(255) NOT NULL COMMENT '刷新令牌',
  `expires_at` timestamp NOT NULL COMMENT '过期时间',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_refresh_token` (`refresh_token`),
  KEY `idx_merchant_id` (`merchant_id`),
  KEY `idx_expires_at` (`expires_at`),
  CONSTRAINT `fk_sessions_merchant_id` FOREIGN KEY (`merchant_id`) REFERENCES `merchants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商户会话表';

-- 创建商户订单统计表
CREATE TABLE IF NOT EXISTS `merchant_statistics` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `merchant_id` int NOT NULL COMMENT '商户ID',
  `date` date NOT NULL COMMENT '日期',
  `total_orders` int NOT NULL DEFAULT '0' COMMENT '总订单数',
  `success_orders` int NOT NULL DEFAULT '0' COMMENT '成功订单数',
  `total_amount` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '总金额（CNY）',
  `success_amount` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '成功金额（CNY）',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_merchant_date` (`merchant_id`,`date`),
  KEY `idx_date` (`date`),
  CONSTRAINT `fk_statistics_merchant_id` FOREIGN KEY (`merchant_id`) REFERENCES `merchants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商户订单统计表';

