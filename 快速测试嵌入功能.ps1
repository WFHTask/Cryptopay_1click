# 快速测试嵌入式支付功能

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  测试嵌入式支付功能" -ForegroundColor Cyan  
Write-Host "========================================`n" -ForegroundColor Cyan

# 使用已有的testuser账户和钱包
$apiKey = "7407ace8d21615cdafaf8594b7211319dbae9c42ccccd28e63239ced75c60e27"

Write-Host "1. 创建支付订单..." -ForegroundColor Yellow
$orderId = "EMBED$(Get-Date -Format 'yyyyMMddHHmmss')"

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/payment/create" `
        -Method POST `
        -ContentType "application/json" `
        -Body "{
            `"api_key`": `"$apiKey`",
            `"order_id`": `"$orderId`",
            `"amount`": 88.88,
            `"notify_url`": `"http://localhost:8080/api/payment/callback`",
            `"redirect_url`": `"http://localhost:3000/payment/success`"
        }"

    Write-Host "   ✅ 支付订单创建成功!`n" -ForegroundColor Green

    Write-Host "2. 支付信息:" -ForegroundColor Yellow
    Write-Host "   订单号: $($response.data.order_id)" -ForegroundColor White
    Write-Host "   金额: ¥$($response.data.amount)" -ForegroundColor White
    Write-Host "   实付: $($response.data.actual_amount) USDT`n" -ForegroundColor White

    Write-Host "3. 嵌入URL:" -ForegroundColor Yellow
    Write-Host "   $($response.data.embed_url)`n" -ForegroundColor Cyan

    Write-Host "4. iframe代码:" -ForegroundColor Yellow
    Write-Host "   $($response.data.iframe_code)`n" -ForegroundColor Cyan

    Write-Host "5. 打开演示页面..." -ForegroundColor Yellow
    
    # 创建临时测试HTML
    $testHtml = @"
<!DOCTYPE html>
<html>
<head>
    <title>嵌入式支付测试</title>
    <style>
        body {
            background: #0a0e27;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            font-family: 'Courier New', monospace;
        }
        h1 {
            color: #00ff9f;
            text-align: center;
            text-shadow: 0 0 10px rgba(0, 255, 159, 0.5);
        }
        .container {
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>[ 嵌入式支付测试 ]</h1>
        $($response.data.iframe_code)
    </div>
</body>
</html>
"@

    $testHtml | Out-File -FilePath "test-embed.html" -Encoding UTF8
    Start-Process "test-embed.html"
    
    Write-Host "`n   ✅ 浏览器已打开测试页面!" -ForegroundColor Green
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "  测试完成！" -ForegroundColor Cyan
    Write-Host "========================================`n" -ForegroundColor Cyan
    
} catch {
    Write-Host "`n   ❌ 创建失败: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`n提示：请确保已添加钱包地址`n" -ForegroundColor Yellow
}

