#!/bin/bash

echo "================================================"
echo "  USDT支付系统 - 启动脚本"
echo "================================================"
echo ""

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker未安装，请先安装Docker"
    exit 1
fi

# 检查Docker Compose是否安装
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose未安装，请先安装Docker Compose"
    exit 1
fi

echo "✅ Docker环境检查通过"
echo ""

# 提示配置API Token
echo "📝 重要提示："
echo "   请确保已在 docker-compose.yml 中配置了 API_AUTH_TOKEN"
echo "   该Token用于API签名验证，必须保持一致"
echo ""

read -p "是否已配置API Token？(y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "请先配置API Token后再启动服务"
    exit 1
fi

echo "🚀 开始启动服务..."
echo ""

# 停止现有服务
echo "停止现有服务..."
docker-compose down

# 构建并启动服务
echo "构建并启动所有服务..."
docker-compose up -d --build

# 等待服务启动
echo ""
echo "⏳ 等待服务启动..."
sleep 10

# 检查服务状态
echo ""
echo "📊 服务状态："
docker-compose ps

echo ""
echo "✅ 服务启动完成！"
echo ""
echo "================================================"
echo "  访问地址"
echo "================================================"
echo "前端页面:   http://localhost:3000"
echo "后端API:    http://localhost:8080"
echo "Epusdt:     http://localhost:8000"
echo "================================================"
echo ""
echo "💡 提示："
echo "   1. 首次启动需要在Epusdt后台添加钱包地址"
echo "   2. 查看日志: docker-compose logs -f"
echo "   3. 停止服务: docker-compose down"
echo ""

