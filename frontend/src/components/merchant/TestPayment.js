import React, { useState } from 'react';
import { paymentAPI } from '../../services/api';
import Layout from './Layout';
import QRCode from 'qrcode';
import './TestPayment.css';

const TestPayment = () => {
  const [loading, setLoading] = useState(false);
  const [paymentType, setPaymentType] = useState('standard'); // 'standard' 或 'embed'
  const [formData, setFormData] = useState({
    amount: '100',
    notify_url: 'https://your-domain.com/callback',
    return_url: 'https://your-domain.com/success',
  });
  const [result, setResult] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [error, setError] = useState('');
  const [embedUrl, setEmbedUrl] = useState('');
  const [iframeCode, setIframeCode] = useState('');

  // 获取商户的API密钥
  const merchant = JSON.parse(localStorage.getItem('merchant'));
  const apiKey = merchant?.api_key;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 重置表单
  const resetForm = () => {
    setResult(null);
    setQrCodeUrl('');
    setEmbedUrl('');
    setIframeCode('');
    setError('');
  };

  const createTestPayment = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    setQrCodeUrl('');
    setEmbedUrl('');
    setIframeCode('');

    try {
      // 生成唯一订单号（前端生成，后台也可以生成）
      const orderId = `TEST_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // 使用API Key调用支付接口
      const response = await paymentAPI.createPayment({
        ...formData,
        order_id: orderId,
        amount: parseFloat(formData.amount),
        api_key: apiKey
      });

      if (response.data.success) {
        const paymentData = response.data.data;
        setResult(paymentData);

        // 获取钱包地址（兼容 token 和 wallet_address 两种字段名）
        const walletAddress = paymentData.token || paymentData.wallet_address;
        
        // 生成二维码
        if (walletAddress) {
          const qrUrl = await QRCode.toDataURL(walletAddress, {
            width: 300,
            margin: 2,
            color: {
              dark: '#00ff9f',
              light: '#0a0e27'
            }
          });
          setQrCodeUrl(qrUrl);
        }

        // 如果是嵌入式支付，生成嵌入URL和iframe代码
        if (paymentType === 'embed') {
          console.log('生成嵌入式支付URL...', paymentData);
          
          if (paymentData.trade_id && walletAddress) {
            const baseUrl = window.location.origin;
            const embedParams = new URLSearchParams({
              order_id: paymentData.order_id || '',
              amount: paymentData.amount || 0,
              actual_amount: paymentData.actual_amount || 0,
              wallet_address: walletAddress,
              expiration_time: Math.floor(Date.now() / 1000) + 600 // 10分钟有效期
            });
            
            const embedUrlValue = `${baseUrl}/embed/payment/${paymentData.trade_id}?${embedParams.toString()}`;
            console.log('生成的嵌入URL:', embedUrlValue);
            setEmbedUrl(embedUrlValue);
            
            const iframeCodeValue = `<iframe src="${embedUrlValue}" width="450" height="650" frameborder="0" scrolling="no" style="border: 2px solid rgba(0,255,159,0.3); border-radius: 12px;"></iframe>`;
            setIframeCode(iframeCodeValue);
          } else {
            console.error('缺少必要字段:', {
              trade_id: paymentData.trade_id,
              wallet_address: walletAddress
            });
            setError('嵌入式支付数据不完整，请重试');
          }
        }
      } else {
        setError(response.data.message || '创建支付失败');
      }
    } catch (err) {
      console.error('Create payment error:', err);
      setError(err.response?.data?.message || '创建支付失败，请检查您的钱包配置');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('已复制到剪贴板');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createTestPayment();
  };

  return (
    <Layout>
      <div className="test-payment">
        <div className="test-payment-header">
          <h1>💳 测试支付功能</h1>
          <p>在这里测试支付订单创建、获取支付码等功能</p>
        </div>

        <div className="test-payment-content">
          {/* 左侧：创建订单表单 */}
          <div className="test-payment-form-section">
            <div className="form-card">
              <h2>创建测试订单</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>支付类型</label>
                  <div className="payment-type-selector">
                    <button
                      type="button"
                      className={`type-btn ${paymentType === 'standard' ? 'active' : ''}`}
                      onClick={() => setPaymentType('standard')}
                    >
                      <span className="type-icon">💳</span>
                      <span>标准支付</span>
                    </button>
                    <button
                      type="button"
                      className={`type-btn ${paymentType === 'embed' ? 'active' : ''}`}
                      onClick={() => setPaymentType('embed')}
                    >
                      <span className="type-icon">🎯</span>
                      <span>嵌入式支付</span>
                    </button>
                  </div>
                  <small>
                    {paymentType === 'standard' 
                      ? '标准支付页面，适合独立支付页面' 
                      : '可嵌入到您的网站中的支付组件'}
                  </small>
                </div>

                <div className="form-group">
                  <label>订单金额（CNY）</label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="请输入金额"
                  />
                  <div className="quick-amounts">
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, amount: '10' }))}>¥10</button>
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, amount: '100' }))}>¥100</button>
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, amount: '500' }))}>¥500</button>
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, amount: '1000' }))}>¥1000</button>
                  </div>
                </div>

                <div className="form-group">
                  <label>回调地址（可选）</label>
                  <input
                    type="url"
                    name="notify_url"
                    value={formData.notify_url}
                    onChange={handleInputChange}
                    placeholder="https://your-domain.com/callback"
                  />
                  <small>支付成功后系统会POST通知到此地址</small>
                </div>

                <div className="form-group">
                  <label>返回地址（可选）</label>
                  <input
                    type="url"
                    name="return_url"
                    value={formData.return_url}
                    onChange={handleInputChange}
                    placeholder="https://your-domain.com/success"
                  />
                  <small>用户支付后跳转的页面</small>
                </div>

                <div className="api-key-info">
                  <label>使用的API密钥</label>
                  <code>{apiKey}</code>
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? '创建中...' : '🚀 创建测试订单'}
                </button>
              </form>

              {error && (
                <div className="error-message">
                  <span className="error-icon">❌</span>
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* API请求示例 */}
            <div className="api-example-card">
              <h3>📝 API调用示例</h3>
              <div className="code-block">
                <pre>{`POST /api/payment/create
Content-Type: application/json

{
  "amount": ${formData.amount},
  "order_id": "TEST_自动生成",
  "notify_url": "${formData.notify_url}",
  "return_url": "${formData.return_url}",
  "api_key": "${apiKey}"
}`}</pre>
              </div>
              <small className="api-note">💡 订单号由系统自动生成，确保唯一性</small>
            </div>
          </div>

          {/* 右侧：支付结果展示 */}
          <div className="test-payment-result-section">
            {result ? (
              <div className="result-card">
                <h2>✅ 订单创建成功</h2>
                
                {/* 支付二维码 */}
                {qrCodeUrl && (
                  <div className="qrcode-section">
                    <img src={qrCodeUrl} alt="支付二维码" className="qrcode-image" />
                    <p className="qrcode-hint">使用USDT钱包扫码支付</p>
                  </div>
                )}

                {/* 支付信息 */}
                <div className="payment-info">
                  <div className="info-item">
                    <label>系统订单号</label>
                    <div className="info-value">
                      <code>{result.trade_id}</code>
                      <button onClick={() => copyToClipboard(result.trade_id)} className="copy-icon">📋</button>
                    </div>
                  </div>

                  <div className="info-item">
                    <label>商户订单号</label>
                    <div className="info-value">
                      <code>{result.order_id}</code>
                      <button onClick={() => copyToClipboard(result.order_id)} className="copy-icon">📋</button>
                    </div>
                  </div>

                  <div className="info-item">
                    <label>支付金额</label>
                    <div className="info-value">
                      <span className="amount">¥{result.amount}</span>
                    </div>
                  </div>

                  <div className="info-item">
                    <label>USDT金额</label>
                    <div className="info-value">
                      <span className="usdt-amount">{result.actual_amount} USDT</span>
                    </div>
                  </div>

                  <div className="info-item full-width">
                    <label>收款地址</label>
                    <div className="info-value">
                      <code className="address">{result.token || result.wallet_address}</code>
                      <button onClick={() => copyToClipboard(result.token || result.wallet_address)} className="copy-icon">📋</button>
                    </div>
                  </div>

                  <div className="info-item">
                    <label>订单状态</label>
                    <div className="info-value">
                      <span className="status-badge status-pending">待支付</span>
                    </div>
                  </div>

                  <div className="info-item">
                    <label>创建时间</label>
                    <div className="info-value">
                      <span>{new Date().toLocaleString('zh-CN')}</span>
                    </div>
                  </div>
                </div>

                {/* 嵌入式支付代码（仅当选择嵌入式支付时显示） */}
                {paymentType === 'embed' && embedUrl && (
                  <div className="embed-code-section">
                    <h3>🎯 嵌入式支付代码</h3>
                    
                    <div className="embed-info-item">
                      <label>嵌入URL</label>
                      <div className="code-box">
                        <code>{embedUrl}</code>
                        <button onClick={() => copyToClipboard(embedUrl)} className="copy-icon">📋</button>
                      </div>
                    </div>

                    <div className="embed-info-item">
                      <label>iframe代码</label>
                      <div className="code-box">
                        <pre>{iframeCode}</pre>
                        <button onClick={() => copyToClipboard(iframeCode)} className="copy-icon">📋</button>
                      </div>
                    </div>

                    <div className="embed-preview">
                      <label>预览效果</label>
                      <div className="iframe-container">
                        <iframe
                          src={embedUrl}
                          width="450"
                          height="650"
                          frameBorder="0"
                          scrolling="no"
                          title="嵌入式支付预览"
                          style={{
                            border: '2px solid rgba(0,255,159,0.3)',
                            borderRadius: '12px',
                            background: '#0a0e27'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 操作按钮 */}
                <div className="result-actions">
                  {paymentType === 'standard' ? (
                    <button 
                      onClick={() => {
                        if (result?.trade_id) {
                          window.open(`/payment/${result.trade_id}`, '_blank');
                        } else {
                          alert('订单ID不存在');
                        }
                      }}
                      className="action-btn primary"
                    >
                      📱 打开支付页面
                    </button>
                  ) : (
                    <button 
                      onClick={() => {
                        console.log('点击打开演示页面，embedUrl:', embedUrl);
                        if (embedUrl) {
                          // 打开演示页面，展示如何使用嵌入代码
                          const demoUrl = `/embed-demo.html?url=${encodeURIComponent(embedUrl)}&orderId=${result.order_id}&amount=${result.amount}`;
                          console.log('正在打开演示页面:', demoUrl);
                          window.open(demoUrl, '_blank');
                        } else {
                          console.error('embedUrl为空');
                          alert('嵌入URL未生成，请确保：\n1. 选择了"嵌入式支付"类型\n2. 订单创建成功\n3. 查看浏览器控制台获取更多信息');
                        }
                      }}
                      className="action-btn primary"
                    >
                      🎯 打开演示页面 {!embedUrl && '(未生成)'}
                    </button>
                  )}
                  <button 
                    onClick={resetForm}
                    className="action-btn secondary"
                  >
                    🔄 创建新订单
                  </button>
                </div>

                {/* 测试提示 */}
                <div className="test-tips">
                  <h4>💡 测试提示</h4>
                  {paymentType === 'standard' ? (
                    <ul>
                      <li>请使用真实的USDT-TRC20钱包进行测试</li>
                      <li>支付时请确保金额与显示的USDT金额一致</li>
                      <li>可以在"订单管理"页面查看订单状态</li>
                      <li>测试环境请使用小额进行测试</li>
                    </ul>
                  ) : (
                    <ul>
                      <li>嵌入式支付可直接嵌入到您的网站中</li>
                      <li>复制iframe代码粘贴到您的HTML页面</li>
                      <li>建议iframe尺寸: 宽450px，高650px</li>
                      <li>支持响应式，可根据需要调整尺寸</li>
                      <li>查看完整示例: 嵌入式支付使用指南.md</li>
                    </ul>
                  )}
                </div>
              </div>
            ) : (
              <div className="placeholder-card">
                <div className="placeholder-icon">💳</div>
                <h3>创建订单查看结果</h3>
                <p>填写左侧表单并点击创建按钮</p>
                <p>即可生成测试订单和支付二维码</p>
              </div>
            )}
          </div>
        </div>

        {/* 功能说明 */}
        <div className="feature-description">
          <h2>🔧 功能说明</h2>
          <div className="feature-grid">
            <div className="feature-item">
              <div className="feature-icon">🎯</div>
              <h3>订单创建</h3>
              <p>使用您的API密钥创建支付订单，支持自定义金额和订单号</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">📱</div>
              <h3>二维码生成</h3>
              <p>自动生成支付二维码，用户可扫码完成USDT支付</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🎨</div>
              <h3>嵌入式支付</h3>
              <p>生成可嵌入的iframe代码，直接集成到您的网站中</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🔔</div>
              <h3>异步回调</h3>
              <p>支付成功后系统会POST通知到您的回调地址</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">📊</div>
              <h3>订单追踪</h3>
              <p>可在订单管理页面实时查看订单状态和支付详情</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">👁️</div>
              <h3>实时预览</h3>
              <p>嵌入式支付支持实时预览，查看实际效果</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TestPayment;

