import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import './EmbedPayment.css';

const EmbedPayment = () => {
  const { tradeId } = useParams();
  const [searchParams] = useSearchParams();
  const [paymentData, setPaymentData] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // 从URL参数获取支付信息
    const data = {
      trade_id: tradeId,
      order_id: searchParams.get('order_id'),
      amount: parseFloat(searchParams.get('amount')),
      actual_amount: parseFloat(searchParams.get('actual_amount')),
      wallet_address: searchParams.get('wallet_address'),
      expiration_time: parseInt(searchParams.get('expiration_time')),
    };

    setPaymentData(data);

    // 计算剩余时间
    const calculateTimeRemaining = () => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = data.expiration_time - now;
      return remaining > 0 ? remaining : 0;
    };

    setTimeRemaining(calculateTimeRemaining());

    const timer = setInterval(() => {
      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);
      if (remaining <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [tradeId, searchParams]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!paymentData) {
    return <div className="embed-loading">加载中...</div>;
  }

  return (
    <div className="embed-payment">
      {timeRemaining > 0 ? (
        <>
          <div className="embed-header">
            <div className="timer-display">
              <span className="timer-icon">⏱</span>
              <span className="timer-text">{formatTime(timeRemaining)}</span>
            </div>
          </div>

          <div className="qr-container">
            <div className="qr-code">
              <QRCodeSVG 
                value={paymentData.wallet_address}
                size={200}
                level="H"
                includeMargin={false}
              />
            </div>
            <p className="scan-hint">扫描二维码支付</p>
          </div>

          <div className="payment-info">
            <div className="info-row highlight">
              <span className="label">支付金额</span>
              <span className="value amount">¥{paymentData.amount?.toFixed(2)}</span>
            </div>

            <div className="info-row highlight">
              <span className="label">实付USDT</span>
              <div className="value-with-copy">
                <span className="value usdt">{paymentData.actual_amount?.toFixed(4)}</span>
                <button 
                  className="mini-copy-btn"
                  onClick={() => copyToClipboard(paymentData.actual_amount?.toFixed(4))}
                  title="复制金额"
                >
                  {copied ? '✓' : '📋'}
                </button>
              </div>
            </div>

            <div className="info-row">
              <span className="label">钱包地址</span>
              <div className="value-with-copy">
                <span className="value address">{paymentData.wallet_address}</span>
                <button 
                  className="mini-copy-btn"
                  onClick={() => copyToClipboard(paymentData.wallet_address)}
                  title="复制地址"
                >
                  {copied ? '✓' : '📋'}
                </button>
              </div>
            </div>
          </div>

          <div className="warning-notice">
            <p>⚠️ 必须转账 <strong>{paymentData.actual_amount?.toFixed(4)} USDT</strong></p>
            <p>⚠️ 使用 <strong>TRC20网络</strong></p>
          </div>
        </>
      ) : (
        <div className="expired-notice">
          <div className="expired-icon">⏰</div>
          <h3>订单已过期</h3>
          <p>请重新创建支付订单</p>
        </div>
      )}

      <div className="powered-by">
        Powered by USDT Payment System
      </div>
    </div>
  );
};

export default EmbedPayment;

