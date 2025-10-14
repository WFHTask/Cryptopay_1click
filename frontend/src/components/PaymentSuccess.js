import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PaymentSuccess.css';

const PaymentSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="payment-success-container">
      <div className="payment-success-card">
        <div className="success-icon">
          <div className="checkmark-circle">
            <div className="checkmark"></div>
          </div>
        </div>
        
        <h1>支付成功！</h1>
        <p className="success-message">
          您的支付已经成功完成，我们已收到您的USDT转账。
        </p>

        <div className="success-details">
          <div className="success-detail-item">
            <span className="icon">✓</span>
            <span>订单已确认</span>
          </div>
          <div className="success-detail-item">
            <span className="icon">✓</span>
            <span>支付已到账</span>
          </div>
          <div className="success-detail-item">
            <span className="icon">✓</span>
            <span>服务已开通</span>
          </div>
        </div>

        <button 
          className="return-btn"
          onClick={() => navigate('/')}
        >
          返回首页
        </button>

        <p className="footer-text">
          感谢您的支付！如有任何问题，请联系客服。
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;

