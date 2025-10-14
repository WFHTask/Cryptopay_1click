# USDT Payment System (多商户支付平台)

[English](#english) | [中文](#chinese)

这是一个基于Gin、React和Epusdt的完整USDT支付解决方案，支持TRC20网络的USDT支付。

## 项目架构

```
payment_v2/
├── backend/           # Gin后端服务
│   ├── main.go
│   ├── routes.go
│   ├── handlers.go
│   ├── go.mod
│   ├── Dockerfile
│   └── .dockerignore
├── frontend/          # React前端
│   ├── src/
│   │   ├── components/
│   │   │   ├── PaymentForm.js      # 支付表单
│   │   │   ├── PaymentPage.js      # 支付页面
│   │   │   └── PaymentSuccess.js   # 支付成功页面
│   │   ├── App.js
│   │   └── index.js
│   ├── public/
│   ├── package.json
│   ├── Dockerfile
│   ├── nginx.conf
│   └── .dockerignore
├── epusdt/            # Epusdt支付服务
│   └── src/
├── docker-compose.yml # Docker编排文件
├── Dockerfile.epusdt  # Epusdt的Dockerfile
└── README.md
```

## 功能特性

### 后端服务（Gin）
- ✅ 创建支付订单
- ✅ 查询订单状态
- ✅ 接收Epusdt支付回调
- ✅ 签名验证机制
- ✅ CORS跨域支持

### 前端界面（React）
- ✅ 现代化UI设计
- ✅ 支付表单（订单号生成、金额输入）
- ✅ 支付页面（二维码显示、倒计时、地址复制）
- ✅ 支付成功页面
- ✅ 响应式布局（支持移动端）

### Epusdt支付服务
- ✅ USDT TRC20网络支付
- ✅ 多钱包地址轮询
- ✅ 订单过期管理
- ✅ 异步回调通知

## 快速开始

### 前置要求

- Docker 20.10+
- Docker Compose 1.29+

### 安装步骤

1. **克隆项目**
```bash
cd payment_v2
```

2. **配置环境变量**

修改 `docker-compose.yml` 中的以下配置：

```yaml
# Epusdt配置
API_AUTH_TOKEN: your_api_token_here_change_me  # 修改为你的API密钥
FORCED_USDT_RATE: 6.5  # USDT汇率

# 后端配置
EPUSDT_API_TOKEN: your_api_token_here_change_me  # 与上面保持一致
```

3. **启动服务**

```bash
# 构建并启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

4. **初始化Epusdt钱包**

访问 Epusdt 管理后台添加USDT钱包地址：
```
http://localhost:8000
```

5. **访问应用**

前端页面：
```
http://localhost:3000
```

后端API：
```
http://localhost:8080/api/health
```

## 服务端口

| 服务 | 端口 | 说明 |
|------|------|------|
| Frontend | 3000 | React前端 |
| Backend | 8080 | Gin后端API |
| Epusdt | 8000 | Epusdt支付服务 |
| MySQL | 3306 | 数据库 |
| Redis | 6379 | 缓存服务 |

## API文档

### 创建支付订单

**请求**
```http
POST /api/payment/create
Content-Type: application/json

{
  "order_id": "ORDER123456",
  "amount": 100.00,
  "description": "商品购买"
}
```

**响应**
```json
{
  "success": true,
  "data": {
    "trade_id": "202203271648380592218340",
    "order_id": "ORDER123456",
    "amount": 100.00,
    "actual_amount": 15.3846,
    "wallet_address": "TNEns8t9jbWENbStkQdVQtHMGpbsYsQjZK",
    "expiration_time": 1648381192,
    "payment_url": "http://localhost:8000/pay/checkout-counter/202203271648380592218340"
  }
}
```

### 查询订单状态

**请求**
```http
GET /api/payment/query/{order_id}
```

**响应**
```json
{
  "success": true,
  "data": {
    "order_id": "ORDER123456",
    "status": "pending"
  }
}
```

## 支付流程

1. 用户在前端输入订单信息和金额
2. 前端调用后端API创建支付订单
3. 后端调用Epusdt API生成支付订单
4. 前端显示支付二维码和钱包地址
5. 用户使用USDT钱包扫码支付
6. Epusdt监听到区块链转账
7. Epusdt回调后端通知支付成功
8. 后端处理业务逻辑（发货、开通服务等）
9. 用户页面自动跳转到成功页面

## 环境变量说明

### Backend（后端）

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| PORT | 服务端口 | 8080 |
| GIN_MODE | 运行模式 | debug/release |
| EPUSDT_URL | Epusdt服务地址 | http://epusdt:8000 |
| EPUSDT_API_TOKEN | API认证密钥 | - |
| NOTIFY_URL | 支付回调地址 | - |
| REDIRECT_URL | 支付成功跳转地址 | - |

### Epusdt（支付服务）

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| APP_DEBUG | 调试模式 | true/false |
| APP_URI | 服务地址 | http://localhost:8000 |
| API_AUTH_TOKEN | API认证密钥 | - |
| MYSQL_HOST | MySQL地址 | mysql |
| MYSQL_PORT | MySQL端口 | 3306 |
| MYSQL_DATABASE | 数据库名 | epusdt |
| MYSQL_USER | 数据库用户 | epusdt |
| MYSQL_PASSWORD | 数据库密码 | - |
| REDIS_HOST | Redis地址 | redis |
| REDIS_PORT | Redis端口 | 6379 |
| ORDER_EXPIRATION_TIME | 订单过期时间（分钟） | 10 |
| FORCED_USDT_RATE | USDT汇率 | 6.5 |

## 开发调试

### 单独运行后端

```bash
cd backend
go mod download
go run .
```

### 单独运行前端

```bash
cd frontend
npm install
npm start
```

### 查看日志

```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f epusdt
```

### 重启服务

```bash
# 重启所有服务
docker-compose restart

# 重启特定服务
docker-compose restart backend
```

## 常见问题

### 1. 支付回调不成功？

检查 `NOTIFY_URL` 配置是否正确，确保Epusdt能够访问到后端服务。

### 2. 订单一直显示等待支付？

- 检查USDT转账金额是否精确匹配
- 检查是否使用TRC20网络
- 查看Epusdt日志确认是否监听到转账

### 3. 前端无法访问后端API？

检查nginx.conf中的proxy_pass配置，确保指向正确的后端地址。

### 4. Epusdt无法连接数据库？

等待MySQL完全启动后再启动Epusdt，或使用 `docker-compose up -d` 让Docker自动处理依赖。

## 生产部署建议

1. **修改默认密码**
   - 修改MySQL root密码和用户密码
   - 修改API_AUTH_TOKEN为强密码

2. **配置HTTPS**
   - 使用nginx反向代理
   - 配置SSL证书

3. **数据备份**
   - 定期备份MySQL数据
   - 备份钱包私钥

4. **监控告警**
   - 配置日志收集
   - 设置支付异常告警

5. **性能优化**
   - 使用Redis缓存
   - 配置数据库连接池
   - 启用CDN加速静态资源

## 安全建议

- ⚠️ 请勿将钱包私钥存储在服务器上
- ⚠️ 定期更换API密钥
- ⚠️ 启用防火墙，仅开放必要端口
- ⚠️ 使用HTTPS加密通信
- ⚠️ 实施访问频率限制

## 技术栈

- **后端**: Go 1.21 + Gin Framework
- **前端**: React 18 + React Router
- **支付**: Epusdt (Go)
- **数据库**: MySQL 8.0
- **缓存**: Redis 7
- **容器化**: Docker + Docker Compose

## 许可证

本项目遵循 MIT 开源协议。

## 免责声明

本项目仅供学习交流使用，请勿用于非法用途。使用本项目产生的任何法律责任由使用者自行承担。

## 致谢

感谢 [Epusdt](https://github.com/assimon/epusdt) 项目提供的支付中间件支持。

## 联系方式

如有问题或建议，欢迎提交Issue。

