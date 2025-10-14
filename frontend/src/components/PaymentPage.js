import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import './PaymentPage.css';

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { paymentData } = location.state || {};
  
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!paymentData) {
      navigate('/');
      return;
    }

    // 计算剩余时间
    const calculateTimeRemaining = () => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = paymentData.expiration_time - now;
      return remaining > 0 ? remaining : 0;
    };

    setTimeRemaining(calculateTimeRemaining());

    // 每秒更新倒计时
    const timer = setInterval(() => {
      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);
      
      if (remaining <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [paymentData, navigate]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(type);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!paymentData) {
    return null;
  }

  return (
    <div className="payment-page-container">
      <div className="payment-page-card">
        <div className="payment-header">
          <h1>请完成支付</h1>
          <div className="timer-container">
            <div className="timer">
              {timeRemaining > 0 ? (
                <>
                  <span className="timer-icon">⏱</span>
                  <span className="timer-text">{formatTime(timeRemaining)}</span>
                </>
              ) : (
                <span className="expired-text">订单已过期</span>
              )}
            </div>
          </div>
        </div>

        {timeRemaining > 0 ? (
          <>
            <div className="qr-section">
              <div className="qr-wrapper">
                <QRCodeSVG 
                  value={paymentData.wallet_address}
                  size={220}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <p className="qr-hint">扫描二维码支付</p>
            </div>

            <div className="payment-details">
              <div className="detail-item">
                <span className="detail-label">订单号</span>
                <span className="detail-value">{paymentData.order_id}</span>
              </div>

              <div className="detail-item highlight">
                <span className="detail-label">支付金额（CNY）</span>
                <span className="detail-value amount">¥{paymentData.amount.toFixed(2)}</span>
              </div>

              <div className="detail-item highlight">
                <span className="detail-label">实际支付（USDT）</span>
                <div className="detail-value-with-copy">
                  <span className="detail-value amount usdt">{paymentData.actual_amount.toFixed(4)} USDT</span>
                  <button 
                    className="copy-btn"
                    onClick={() => copyToClipboard(paymentData.actual_amount.toFixed(4), 'amount')}
                  >
                    {copied === 'amount' ? '✓ 已复制' : '复制'}
                  </button>
                </div>
              </div>

              <div className="detail-item">
                <span className="detail-label">收款地址</span>
                <div className="detail-value-with-copy">
                  <span className="detail-value address">{paymentData.wallet_address}</span>
                  <button 
                    className="copy-btn"
                    onClick={() => copyToClipboard(paymentData.wallet_address, 'address')}
                  >
                    {copied === 'address' ? '✓ 已复制' : '复制'}
                  </button>
                </div>
              </div>
            </div>

            <div className="warning-box">
              <h3>⚠️ 重要提醒</h3>
              <ul>
                <li>请使用 <strong>TRC20网络</strong> 转账USDT</li>
                <li>必须转账 <strong>{paymentData.actual_amount.toFixed(4)} USDT</strong>，多转少转都无法到账</li>
                <li>订单有效期 <strong>10分钟</strong>，过期后需重新创建</li>
                <li>支付成功后，页面会自动跳转</li>
              </ul>
            </div>

            <div className="button-group">
              <button 
                className="secondary-btn"
                onClick={() => navigate('/')}
              >
                返回首页
              </button>
              <button 
                className="primary-btn"
                onClick={() => window.location.reload()}
              >
                刷新状态
              </button>
            </div>
          </>
        ) : (
          <div className="expired-container">
            <div className="expired-icon">⏰</div>
            <h2>订单已过期</h2>
            <p>请返回首页重新创建支付订单</p>
            <button 
              className="primary-btn"
              onClick={() => navigate('/')}
            >
              返回首页
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;

