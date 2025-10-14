import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PaymentForm.css';

const PaymentForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    orderId: '',
    amount: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/payment/create', {
        order_id: formData.orderId,
        amount: parseFloat(formData.amount),
        description: formData.description
      });

      if (response.data.success) {
        // 跳转到支付页面
        navigate(`/payment/${formData.orderId}`, {
          state: { paymentData: response.data.data }
        });
      }
    } catch (err) {
      setError(err.response?.data?.error || '创建支付订单失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 生成随机订单号
  const generateOrderId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    setFormData(prev => ({
      ...prev,
      orderId: `ORDER${timestamp}${random}`
    }));
  };

  return (
    <div className="payment-form-container">
      <div className="payment-form-card">
        <div className="form-header">
          <h1>USDT支付系统</h1>
          <p>安全、快速的数字货币支付</p>
        </div>

        <form onSubmit={handleSubmit} className="payment-form">
          <div className="form-group">
            <label htmlFor="orderId">订单号</label>
            <div className="input-with-button">
              <input
                type="text"
                id="orderId"
                name="orderId"
                value={formData.orderId}
                onChange={handleChange}
                placeholder="输入订单号或点击生成"
                required
              />
              <button 
                type="button" 
                onClick={generateOrderId}
                className="generate-btn"
              >
                生成
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="amount">支付金额（CNY）</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="请输入支付金额"
              step="0.01"
              min="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">订单描述（可选）</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="请输入订单描述"
              rows="3"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? '创建中...' : '创建支付订单'}
          </button>
        </form>

        <div className="info-section">
          <h3>支付说明</h3>
          <ul>
            <li>支持USDT TRC20网络支付</li>
            <li>订单有效期为10分钟</li>
            <li>请按照显示的精确金额支付</li>
            <li>支付成功后会自动跳转</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;

