#!/bin/bash

echo "================================================"
echo "  USDT支付系统 - 停止脚本"
echo "================================================"
echo ""

echo "🛑 停止所有服务..."
docker-compose down

echo ""
echo "✅ 所有服务已停止"
echo ""
echo "💡 提示："
echo "   - 重新启动: ./start.sh 或 docker-compose up -d"
echo "   - 清除数据: docker-compose down -v"
echo ""

