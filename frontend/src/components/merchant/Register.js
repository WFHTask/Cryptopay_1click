import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiKeys, setApiKeys] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 验证密码
    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    if (formData.password.length < 6) {
      setError('密码长度至少为6位');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      if (response.data.success) {
        // 显示API密钥
        setApiKeys(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || '注册失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    // 保存token并跳转
    localStorage.setItem('token', apiKeys.token);
    localStorage.setItem('merchant', JSON.stringify(apiKeys));
    navigate('/merchant/dashboard');
  };

  if (apiKeys) {
    return (
      <div className="auth-container">
        <div className="auth-card api-keys-card">
          <div className="auth-header">
            <h1>注册成功！</h1>
            <p>请妥善保管您的API密钥</p>
          </div>

          <div className="api-keys-display">
            <div className="api-key-item">
              <label>API Key</label>
              <div className="key-value">
                <code>{apiKeys.api_key}</code>
                <button
                  onClick={() => navigator.clipboard.writeText(apiKeys.api_key)}
                  className="copy-btn-small"
                >
                  复制
                </button>
              </div>
            </div>

            <div className="api-key-item">
              <label>API Secret</label>
              <div className="key-value">
                <code>{apiKeys.api_secret}</code>
                <button
                  onClick={() => navigator.clipboard.writeText(apiKeys.api_secret)}
                  className="copy-btn-small"
                >
                  复制
                </button>
              </div>
            </div>
          </div>

          <div className="warning-box">
            <strong>⚠️ 重要提示：</strong>
            <ul>
              <li>请立即复制并安全保存这些密钥</li>
              <li>API Key用于创建支付订单</li>
              <li>API Secret用于签名验证，请勿泄露</li>
              <li>离开此页面后将无法再次查看API Secret</li>
            </ul>
          </div>

          <button onClick={handleContinue} className="submit-btn">
            我已保存，进入管理后台
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>商户注册</h1>
          <p>创建账户，开始接收USDT支付</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">用户名</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="请输入用户名（3-50个字符）"
              required
              minLength="3"
              maxLength="50"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">邮箱</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="请输入邮箱地址"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">密码</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="请输入密码（至少6位）"
              required
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">确认密码</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="请再次输入密码"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? '注册中...' : '注册'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            已有账户？ <Link to="/merchant/login">立即登录</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

