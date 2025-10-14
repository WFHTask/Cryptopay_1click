import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: '⚡',
      title: '快速接入',
      description: '5分钟完成注册，自动生成API密钥，即刻开始收款'
    },
    {
      icon: '💰',
      title: '零成本启动',
      description: '无需预付费用，无月租，无隐藏费用，注册即用'
    },
    {
      icon: '🔐',
      title: '资金安全',
      description: '直接到您的USDT钱包，无需中间账户，资金完全掌控'
    },
    {
      icon: '📊',
      title: '实时统计',
      description: '订单实时查询，数据分析报表，掌握每笔交易'
    },
    {
      icon: '🌍',
      title: '全球收款',
      description: '支持全球USDT支付，24小时不间断，无地域限制'
    },
    {
      icon: '🔧',
      title: '简单集成',
      description: 'RESTful API，完整文档，支持多种开发语言'
    }
  ];

  const useCases = [
    {
      icon: '🛒',
      title: '电商平台',
      description: '为您的在线商城快速接入USDT支付，支持订单回调，自动确认收款'
    },
    {
      icon: '🎮',
      title: '游戏充值',
      description: '游戏道具、会员充值，支持小额高频交易，到账快速'
    },
    {
      icon: '📱',
      title: 'SaaS服务',
      description: '订阅服务、会员续费，支持定期支付，自动化处理'
    },
    {
      icon: '🎓',
      title: '在线教育',
      description: '课程购买、培训付费，灵活的支付方案，适配多种场景'
    },
    {
      icon: '💼',
      title: '服务平台',
      description: '接单平台、威客网站，支持担保交易，资金安全可靠'
    },
    {
      icon: '🌐',
      title: '跨境业务',
      description: '全球收款无障碍，支持多币种，实时汇率转换'
    }
  ];

  const steps = [
    {
      number: '01',
      title: '注册账号',
      description: '填写基本信息，30秒完成注册',
      icon: '📝'
    },
    {
      number: '02',
      title: '添加钱包',
      description: '添加您的USDT-TRC20收款地址',
      icon: '👛'
    },
    {
      number: '03',
      title: '获取密钥',
      description: '系统自动生成API Key和Secret',
      icon: '🔑'
    },
    {
      number: '04',
      title: '开始收款',
      description: '调用API创建订单，即刻开始收款',
      icon: '💰'
    }
  ];

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="terminal-header">
            <span className="terminal-prompt">root@payment-system:~$</span>
            <span className="terminal-cursor">_</span>
          </div>
          <h1 className="hero-title">
            为您的业务接入<span className="highlight">USDT</span>支付
          </h1>
          <p className="hero-subtitle">
            5分钟开始收款 · 资金直达钱包 · 全球化支付解决方案
          </p>
          <div className="hero-features-list">
            <div className="hero-feature-item">
              <span className="check-icon">✓</span>
              <span>零成本启动，无月租费</span>
            </div>
            <div className="hero-feature-item">
              <span className="check-icon">✓</span>
              <span>资金直达您的钱包</span>
            </div>
            <div className="hero-feature-item">
              <span className="check-icon">✓</span>
              <span>5分钟完成集成</span>
            </div>
            <div className="hero-feature-item">
              <span className="check-icon">✓</span>
              <span>24/7全球收款</span>
            </div>
          </div>
          <div className="hero-actions">
            <button 
              className="btn-primary" 
              onClick={() => navigate('/merchant/register')}
            >
              立即开始 →
            </button>
            <button 
              className="btn-secondary" 
              onClick={() => navigate('/merchant/login')}
            >
              商户登录
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="code-window">
            <div className="window-header">
              <span className="dot red"></span>
              <span className="dot yellow"></span>
              <span className="dot green"></span>
            </div>
            <div className="code-content">
              <pre>
{`// 创建支付订单
const payment = await fetch('/api/payment/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Api-Key': 'your_api_key'
  },
  body: JSON.stringify({
    amount: 100.00,
    order_id: 'ORDER_123',
    notify_url: 'https://your.site/callback'
  })
});

// 获取支付地址和二维码
const { token, qr_code } = await payment.json();
console.log('支付地址:', token);
`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">
          <span className="title-bracket">[</span>
          核心功能
          <span className="title-bracket">]</span>
        </h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div className="feature-card" key={index}>
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="use-cases-section">
        <h2 className="section-title">
          <span className="title-bracket">&gt;&gt;</span>
          适用场景
          <span className="title-bracket">&lt;&lt;</span>
        </h2>
        <p className="section-subtitle">
          无论您是什么类型的业务，我们都能为您提供完善的支付解决方案
        </p>
        <div className="use-cases-grid">
          {useCases.map((useCase, index) => (
            <div className="use-case-card" key={index}>
              <div className="use-case-icon">{useCase.icon}</div>
              <h3 className="use-case-title">{useCase.title}</h3>
              <p className="use-case-description">{useCase.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Steps Section */}
      <section className="steps-section">
        <h2 className="section-title">
          <span className="title-bracket">{'<'}</span>
          开始使用
          <span className="title-bracket">{'>'}</span>
        </h2>
        <p className="section-subtitle">
          简单四步，快速开启您的USDT收款之旅
        </p>
        <div className="steps-container">
          {steps.map((step, index) => (
            <div className="step-item" key={index}>
              <div className="step-number">{step.number}</div>
              <div className="step-icon">{step.icon}</div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-description">{step.description}</p>
              {index < steps.length - 1 && <div className="step-connector">→</div>}
            </div>
          ))}
        </div>
      </section>

      {/* Merchant Features Section */}
      <section className="merchant-features-section">
        <h2 className="section-title">
          <span className="title-bracket">[</span>
          商户功能
          <span className="title-bracket">]</span>
        </h2>
        <div className="merchant-features-container">
          <div className="merchant-feature-main">
            <div className="feature-box">
              <h3>💼 商户管理后台</h3>
              <ul className="feature-list">
                <li><span className="bullet">▸</span> 实时数据统计仪表盘</li>
                <li><span className="bullet">▸</span> 今日/总计订单统计</li>
                <li><span className="bullet">▸</span> 成功率和金额分析</li>
                <li><span className="bullet">▸</span> API密钥安全管理</li>
              </ul>
            </div>
            <div className="feature-box">
              <h3>👛 钱包地址管理</h3>
              <ul className="feature-list">
                <li><span className="bullet">▸</span> 添加多个收款地址</li>
                <li><span className="bullet">▸</span> 自定义钱包名称</li>
                <li><span className="bullet">▸</span> 启用/停用钱包</li>
                <li><span className="bullet">▸</span> 订单智能分配</li>
              </ul>
            </div>
          </div>
          <div className="merchant-feature-main">
            <div className="feature-box">
              <h3>📋 订单管理系统</h3>
              <ul className="feature-list">
                <li><span className="bullet">▸</span> 订单列表分页查询</li>
                <li><span className="bullet">▸</span> 订单状态实时更新</li>
                <li><span className="bullet">▸</span> 支付详情完整展示</li>
                <li><span className="bullet">▸</span> 交易记录永久保存</li>
              </ul>
            </div>
            <div className="feature-box">
              <h3>🔌 API集成接口</h3>
              <ul className="feature-list">
                <li><span className="bullet">▸</span> RESTful API设计</li>
                <li><span className="bullet">▸</span> 支付创建接口</li>
                <li><span className="bullet">▸</span> 异步回调通知</li>
                <li><span className="bullet">▸</span> 完整的接口文档</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">立即开始接收USDT支付</h2>
          <p className="cta-subtitle">
            免费注册，无需信用卡，5分钟即可开始收款
          </p>
          <div className="cta-features">
            <div className="cta-feature">
              <span className="cta-icon">⚡</span>
              <span>快速开通</span>
            </div>
            <div className="cta-feature">
              <span className="cta-icon">🆓</span>
              <span>零成本启动</span>
            </div>
            <div className="cta-feature">
              <span className="cta-icon">🔒</span>
              <span>资金安全</span>
            </div>
          </div>
          <div className="cta-actions">
            <button 
              className="btn-primary large" 
              onClick={() => navigate('/merchant/register')}
            >
              免费注册商户账号 →
            </button>
            <button 
              className="btn-outline large" 
              onClick={() => navigate('/merchant/login')}
            >
              已有账号？立即登录
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>USDT Payment System</h3>
            <p>企业级多商户支付解决方案</p>
          </div>
          <div className="footer-links">
            <div className="link-group">
              <h4>商户服务</h4>
              <a onClick={() => navigate('/merchant/register')}>商户注册</a>
              <a onClick={() => navigate('/merchant/login')}>商户登录</a>
              <a onClick={() => navigate('/merchant/dashboard')}>商户后台</a>
            </div>
            <div className="link-group">
              <h4>功能</h4>
              <a onClick={() => navigate('/merchant/wallets')}>钱包管理</a>
              <a onClick={() => navigate('/merchant/orders')}>订单查询</a>
              <a onClick={() => navigate('/payment/create')}>创建支付</a>
            </div>
            <div className="link-group">
              <h4>资源</h4>
              <a href="http://localhost:8080/api" target="_blank" rel="noopener noreferrer">API文档</a>
              <a onClick={() => navigate('/merchant/register')}>快速开始</a>
              <a onClick={() => navigate('/admin/dashboard')}>管理员入口</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025 USDT Payment System. All rights reserved.</p>
          <p className="footer-version">Version 2.0.0 - Geek Edition</p>
        </div>
      </footer>

      {/* Floating Action Button */}
      <div className="fab-container">
        <button 
          className="fab"
          onClick={() => navigate('/merchant/register')}
          title="立即注册"
        >
          🚀
        </button>
      </div>
    </div>
  );
}

export default LandingPage;

