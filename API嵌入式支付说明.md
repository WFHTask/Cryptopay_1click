# 🎯 API嵌入式支付完整说明

## ✅ 已实现功能

### 1. API自动返回嵌入代码

当您调用 `/api/payment/create` 创建支付订单时，后端会**自动返回**嵌入式支付所需的所有信息。

## 📡 API请求示例

### 请求

```http
POST /api/payment/create
Content-Type: application/json

{
  "amount": 100,
  "order_id": "ORDER_123",
  "api_key": "your_api_key_here",
  "notify_url": "https://your-domain.com/callback",
  "return_url": "https://your-domain.com/success"
}
```

### 响应（包含嵌入式代码）

```json
{
  "success": true,
  "data": {
    "trade_id": "202510151760465706094566",
    "order_id": "TEST_1760465706083_e9i9396ko",
    "amount": 100,
    "actual_amount": 15.4,
    "wallet_address": "TNEns8t9jbWENbStkQdVQtHMGpbsYsQjZK",
    
    // ⭐ 标准支付URL
    "payment_url": "http://localhost:8000/pay/checkout-counter/202510151760465706094566",
    
    // ⭐ 嵌入式支付URL（可直接在浏览器打开）
    "embed_url": "http://localhost:3000/embed/payment/202510151760465706094566?order_id=TEST_1760465706083_e9i9396ko&amount=100.00&actual_amount=15.4000&wallet_address=TNEns8t9jbWENbStkQdVQtHMGpbsYsQjZK&expiration_time=1760466306",
    
    // ⭐ 完整的iframe HTML代码（可直接使用）
    "iframe_code": "<iframe src=\"http://localhost:3000/embed/payment/202510151760465706094566?order_id=TEST_1760465706083_e9i9396ko&amount=100.00&actual_amount=15.4000&wallet_address=TNEns8t9jbWENbStkQdVQtHMGpbsYsQjZK&expiration_time=1760466306\" width=\"450\" height=\"650\" frameborder=\"0\" scrolling=\"no\" style=\"border: 2px solid rgba(0,255,159,0.3); border-radius: 12px;\"></iframe>",
    
    "expiration_time": 1760466306
  }
}
```

## 💡 返回字段说明

| 字段 | 说明 | 用途 |
|------|------|------|
| `payment_url` | 标准支付页面URL | 跳转式支付 |
| `embed_url` | 嵌入式支付页面URL | iframe src属性 |
| `iframe_code` | 完整的iframe HTML代码 | 直接嵌入HTML |
| `wallet_address` | USDT收款地址 | 用于生成二维码 |
| `expiration_time` | 订单过期时间戳 | 倒计时显示 |

## 🔧 三种使用方式

### 方式1：直接使用iframe_code（最简单）✅

```html
<!-- 从API响应中获取 iframe_code -->
<div id="payment-container">
  <!-- 直接插入返回的 iframe_code -->
</div>

<script>
fetch('/api/payment/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        amount: 100,
        api_key: 'your_api_key'
    })
})
.then(res => res.json())
.then(data => {
    // 直接使用返回的 iframe_code
    document.getElementById('payment-container').innerHTML = data.data.iframe_code;
});
</script>
```

### 方式2：使用embed_url动态创建iframe

```javascript
fetch('/api/payment/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        amount: 100,
        api_key: 'your_api_key'
    })
})
.then(res => res.json())
.then(data => {
    // 使用返回的 embed_url
    const iframe = document.createElement('iframe');
    iframe.src = data.data.embed_url;
    iframe.width = '450';
    iframe.height = '650';
    iframe.frameBorder = '0';
    iframe.scrolling = 'no';
    iframe.style.cssText = 'border: 2px solid rgba(0,255,159,0.3); border-radius: 12px;';
    
    document.getElementById('payment-container').appendChild(iframe);
});
```

### 方式3：在新窗口打开embed_url

```javascript
fetch('/api/payment/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        amount: 100,
        api_key: 'your_api_key'
    })
})
.then(res => res.json())
.then(data => {
    // 在新窗口打开嵌入式支付页面
    window.open(data.data.embed_url, '_blank');
});
```

## 🌟 完整集成示例

### HTML + JavaScript

```html
<!DOCTYPE html>
<html>
<head>
    <title>商品购买</title>
    <style>
        .payment-container {
            max-width: 500px;
            margin: 50px auto;
            text-align: center;
        }
        .buy-button {
            padding: 15px 40px;
            font-size: 18px;
            background: #00ff9f;
            border: none;
            border-radius: 8px;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <div class="payment-container">
        <h1>商品名称</h1>
        <p>价格: ¥100</p>
        <button class="buy-button" onclick="createPayment()">立即购买</button>
        <div id="payment-iframe"></div>
    </div>

    <script>
        function createPayment() {
            fetch('http://localhost:8080/api/payment/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: 100,
                    order_id: 'ORDER_' + Date.now(),
                    api_key: 'your_api_key_here',
                    notify_url: 'https://your-domain.com/callback',
                    return_url: 'https://your-domain.com/success'
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // 方式1: 直接使用 iframe_code
                    document.getElementById('payment-iframe').innerHTML = data.data.iframe_code;
                    
                    // 或 方式2: 使用 embed_url
                    // const iframe = document.createElement('iframe');
                    // iframe.src = data.data.embed_url;
                    // iframe.width = '450';
                    // iframe.height = '650';
                    // document.getElementById('payment-iframe').appendChild(iframe);
                } else {
                    alert('创建支付失败: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('请求失败');
            });
        }
    </script>
</body>
</html>
```

### React示例

```jsx
import React, { useState } from 'react';

function PaymentComponent() {
    const [iframeCode, setIframeCode] = useState('');

    const createPayment = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/payment/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: 100,
                    order_id: `ORDER_${Date.now()}`,
                    api_key: 'your_api_key_here',
                    notify_url: 'https://your-domain.com/callback',
                    return_url: 'https://your-domain.com/success'
                })
            });

            const data = await response.json();
            
            if (data.success) {
                // 使用 iframe_code
                setIframeCode(data.data.iframe_code);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div>
            <button onClick={createPayment}>创建支付</button>
            {iframeCode && (
                <div dangerouslySetInnerHTML={{ __html: iframeCode }} />
            )}
        </div>
    );
}

export default PaymentComponent;
```

### Vue示例

```vue
<template>
  <div>
    <button @click="createPayment">创建支付</button>
    <div v-html="iframeCode"></div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      iframeCode: ''
    };
  },
  methods: {
    async createPayment() {
      try {
        const response = await fetch('http://localhost:8080/api/payment/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: 100,
            order_id: `ORDER_${Date.now()}`,
            api_key: 'your_api_key_here',
            notify_url: 'https://your-domain.com/callback',
            return_url: 'https://your-domain.com/success'
          })
        });

        const data = await response.json();
        
        if (data.success) {
          this.iframeCode = data.data.iframe_code;
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  }
};
</script>
```

## 📱 响应式设计

### 适配移动端

```html
<style>
    .payment-container {
        max-width: 100%;
        padding: 20px;
    }
    
    .payment-container iframe {
        max-width: 450px;
        width: 100%;
        height: 650px;
    }
    
    @media (max-width: 768px) {
        .payment-container iframe {
            height: 550px;
        }
    }
</style>

<div class="payment-container">
    <!-- iframe 会自动适配 -->
</div>
```

## 🔒 安全建议

1. **API密钥保护**
   - 永远不要在前端暴露API密钥
   - 在后端服务器调用支付API

2. **CSP设置**
```html
<meta http-equiv="Content-Security-Policy" 
      content="frame-src http://localhost:3000;">
```

3. **HTTPS**
   - 生产环境必须使用HTTPS
   - 确保支付页面安全

## 🎯 测试流程

### 1. 在测试页面测试
```
访问: http://localhost:3000/merchant/test
1. 选择"嵌入式支付"
2. 创建订单
3. 点击"打开演示页面"
4. 查看完整的集成示例
```

### 2. API测试

```bash
# PowerShell
$response = Invoke-RestMethod -Uri "http://localhost:8080/api/payment/create" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"amount":100,"api_key":"your_api_key"}'

# 查看返回的嵌入代码
Write-Host $response.data.iframe_code
Write-Host $response.data.embed_url
```

## 📊 字段完整性

✅ **已返回的字段：**
- `embed_url` - 嵌入式支付URL
- `iframe_code` - 完整的iframe HTML代码
- `payment_url` - 标准支付URL
- `wallet_address` - 收款地址
- `expiration_time` - 过期时间

✅ **无需额外API请求**
- 创建支付时一次性返回所有信息
- 前端可以直接使用
- 无需二次请求

## 🚀 快速开始

```javascript
// 1. 创建支付订单
const response = await fetch('/api/payment/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        amount: 100,
        api_key: 'your_api_key'
    })
});

const data = await response.json();

// 2. 直接使用返回的 iframe_code
document.getElementById('payment').innerHTML = data.data.iframe_code;

// 完成！✅
```

## 📚 相关文档

- 📄 `测试支付功能说明.md` - 测试页面使用指南
- 📄 `嵌入式支付使用指南.md` - 详细的嵌入式支付文档
- 📄 `embed-demo.html` - 完整的演示页面
- 📄 `/merchant/test` - 在线测试工具

## 💡 总结

✅ **API已经完全支持嵌入式支付**
- 创建支付时自动返回 `embed_url` 和 `iframe_code`
- 无需额外配置或请求
- 可以直接使用返回的代码

✅ **三种使用方式**
1. 直接使用 `iframe_code`（推荐）
2. 使用 `embed_url` 动态创建iframe
3. 在新窗口打开 `embed_url`

✅ **完整的演示**
- 测试页面提供实时测试
- 演示页面展示完整集成示例
- 包含多种前端框架示例

立即开始使用嵌入式支付功能吧！🎉

