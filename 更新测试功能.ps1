# 更新测试功能脚本

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  更新商户测试支付功能" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查是否在项目根目录
if (-not (Test-Path "docker-compose.yml")) {
    Write-Host "❌ 错误: 请在项目根目录运行此脚本" -ForegroundColor Red
    exit 1
}

# 步骤1: 安装前端依赖
Write-Host "📦 步骤1: 安装前端依赖..." -ForegroundColor Yellow
Set-Location frontend

if (Test-Path "node_modules") {
    Write-Host "   ℹ️  检测到已有node_modules，更新依赖..." -ForegroundColor Gray
    npm install qrcode
} else {
    Write-Host "   ℹ️  首次安装，安装所有依赖..." -ForegroundColor Gray
    npm install
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 依赖安装失败" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Set-Location ..
Write-Host "✅ 前端依赖安装完成" -ForegroundColor Green
Write-Host ""

# 步骤2: 重新构建Docker容器
Write-Host "🐳 步骤2: 重新构建Docker容器..." -ForegroundColor Yellow
docker-compose up -d --build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker构建失败" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Docker容器构建完成" -ForegroundColor Green
Write-Host ""

# 等待服务启动
Write-Host "⏳ 等待服务启动..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# 步骤3: 检查服务状态
Write-Host "🔍 步骤3: 检查服务状态..." -ForegroundColor Yellow
$services = @(
    @{Name="前端"; Url="http://localhost:3000"},
    @{Name="后端"; Url="http://localhost:8080/api/health"},
    @{Name="数据库管理"; Url="http://localhost:8081"}
)

foreach ($service in $services) {
    try {
        $response = Invoke-WebRequest -Uri $service.Url -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
        Write-Host "   ✅ $($service.Name) 运行正常" -ForegroundColor Green
    } catch {
        Write-Host "   ⚠️  $($service.Name) 可能还在启动中" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ✨ 更新完成！" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "🎯 新功能访问地址：" -ForegroundColor Green
Write-Host ""
Write-Host "   商户登录: " -NoNewline
Write-Host "http://localhost:3000/merchant/login" -ForegroundColor Cyan
Write-Host ""
Write-Host "   测试支付: " -NoNewline
Write-Host "http://localhost:3000/merchant/test" -ForegroundColor Cyan
Write-Host ""

Write-Host "📚 使用步骤：" -ForegroundColor Green
Write-Host "   1. 登录商户后台" -ForegroundColor Gray
Write-Host "   2. 在左侧菜单点击 '🧪 测试支付'" -ForegroundColor Gray
Write-Host "   3. 或在仪表盘点击 '测试支付' 按钮" -ForegroundColor Gray
Write-Host "   4. 填写金额创建测试订单" -ForegroundColor Gray
Write-Host "   5. 获取二维码和支付地址" -ForegroundColor Gray
Write-Host ""

Write-Host "💡 提示：" -ForegroundColor Yellow
Write-Host "   - 需要先在'钱包管理'添加收款地址" -ForegroundColor Gray
Write-Host "   - 查看详细说明: 测试支付功能说明.md" -ForegroundColor Gray
Write-Host ""

Write-Host "🔄 查看日志: " -NoNewline
Write-Host "docker-compose logs -f frontend" -ForegroundColor Cyan
Write-Host ""

