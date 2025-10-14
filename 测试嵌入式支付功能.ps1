# 测试嵌入式支付功能

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  测试嵌入式支付功能" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查服务是否运行
Write-Host "📋 检查服务状态..." -ForegroundColor Yellow
$frontendRunning = $false
$backendRunning = $false

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 3 -ErrorAction SilentlyContinue
    $frontendRunning = $true
    Write-Host "   ✅ 前端服务运行正常" -ForegroundColor Green
} catch {
    Write-Host "   ❌ 前端服务未运行" -ForegroundColor Red
}

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/health" -UseBasicParsing -TimeoutSec 3 -ErrorAction SilentlyContinue
    $backendRunning = $true
    Write-Host "   ✅ 后端服务运行正常" -ForegroundColor Green
} catch {
    Write-Host "   ❌ 后端服务未运行" -ForegroundColor Red
}

Write-Host ""

if (-not $frontendRunning -or -not $backendRunning) {
    Write-Host "⚠️  服务未完全启动，正在启动..." -ForegroundColor Yellow
    docker-compose up -d
    Write-Host "⏳ 等待服务启动（30秒）..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  🎯 新功能说明" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1️⃣  自动生成订单号" -ForegroundColor Green
Write-Host "   - 订单号默认自动生成" -ForegroundColor Gray
Write-Host "   - 每次创建新订单时自动刷新" -ForegroundColor Gray
Write-Host "   - 可手动关闭自动刷新功能" -ForegroundColor Gray
Write-Host ""

Write-Host "2️⃣  嵌入式支付测试" -ForegroundColor Green
Write-Host "   - 选择'🎯 嵌入式支付'类型" -ForegroundColor Gray
Write-Host "   - 自动生成嵌入URL和iframe代码" -ForegroundColor Gray
Write-Host "   - 实时预览嵌入效果" -ForegroundColor Gray
Write-Host "   - 一键复制代码到您的网站" -ForegroundColor Gray
Write-Host "   - 点击按钮在新窗口打开" -ForegroundColor Gray
Write-Host ""

Write-Host "3️⃣  修复的问题" -ForegroundColor Green
Write-Host "   ✅ 修复了点击'打开嵌入式页面'无反应的问题" -ForegroundColor Gray
Write-Host "   ✅ 添加了URL验证和错误提示" -ForegroundColor Gray
Write-Host "   ✅ 按钮禁用状态提示" -ForegroundColor Gray
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  📖 使用步骤" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "步骤1: 登录商户后台" -ForegroundColor Yellow
Write-Host "   访问: " -NoNewline
Write-Host "http://localhost:3000/merchant/login" -ForegroundColor Cyan
Write-Host ""

Write-Host "步骤2: 进入测试支付页面" -ForegroundColor Yellow
Write-Host "   - 点击左侧菜单 '🧪 测试支付'" -ForegroundColor Gray
Write-Host "   - 或在仪表盘点击 '测试支付' 按钮" -ForegroundColor Gray
Write-Host ""

Write-Host "步骤3: 测试标准支付" -ForegroundColor Yellow
Write-Host "   1. 选择 '💳 标准支付'" -ForegroundColor Gray
Write-Host "   2. 输入金额（订单号自动生成）" -ForegroundColor Gray
Write-Host "   3. 点击 '🚀 创建测试订单'" -ForegroundColor Gray
Write-Host "   4. 点击 '📱 打开支付页面' 查看" -ForegroundColor Gray
Write-Host ""

Write-Host "步骤4: 测试嵌入式支付" -ForegroundColor Yellow
Write-Host "   1. 选择 '🎯 嵌入式支付'" -ForegroundColor Gray
Write-Host "   2. 输入金额（订单号自动生成）" -ForegroundColor Gray
Write-Host "   3. 点击 '🚀 创建测试订单'" -ForegroundColor Gray
Write-Host "   4. 查看自动生成的嵌入代码" -ForegroundColor Gray
Write-Host "   5. 在预览区域查看效果" -ForegroundColor Gray
Write-Host "   6. 点击 '🎯 打开嵌入式页面' 测试" -ForegroundColor Gray
Write-Host "   7. 复制iframe代码到您的网站" -ForegroundColor Gray
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  🎮 快速测试" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$openBrowser = Read-Host "是否打开浏览器测试? (y/n)"
if ($openBrowser -eq 'y' -or $openBrowser -eq 'Y') {
    Write-Host ""
    Write-Host "🌐 打开测试页面..." -ForegroundColor Green
    Start-Process "http://localhost:3000/merchant/test"
    Write-Host "✅ 浏览器已打开" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  💡 功能特点" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "✨ 自动化" -ForegroundColor Green
Write-Host "   - 订单号自动生成" -ForegroundColor Gray
Write-Host "   - 二维码自动生成" -ForegroundColor Gray
Write-Host "   - 嵌入代码自动生成" -ForegroundColor Gray
Write-Host ""

Write-Host "✨ 智能提示" -ForegroundColor Green
Write-Host "   - URL验证" -ForegroundColor Gray
Write-Host "   - 按钮状态提示" -ForegroundColor Gray
Write-Host "   - 错误信息提示" -ForegroundColor Gray
Write-Host ""

Write-Host "✨ 便捷操作" -ForegroundColor Green
Write-Host "   - 一键复制" -ForegroundColor Gray
Write-Host "   - 实时预览" -ForegroundColor Gray
Write-Host "   - 快速刷新" -ForegroundColor Gray
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  📚 相关文档" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📄 测试支付功能说明.md - 完整使用指南" -ForegroundColor Gray
Write-Host "📄 嵌入式支付使用指南.md - 嵌入式支付详解" -ForegroundColor Gray
Write-Host "📄 embed-demo.html - 完整集成示例" -ForegroundColor Gray
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✅ 准备完成！开始测试吧！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "💡 提示: 需要先在'钱包管理'添加USDT收款地址" -ForegroundColor Yellow
Write-Host ""

