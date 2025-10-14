import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { merchantAPI } from '../../services/api';
import Layout from './Layout';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [merchant, setMerchant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const merchantData = JSON.parse(localStorage.getItem('merchant'));
      setMerchant(merchantData);

      const response = await merchantAPI.getStatistics();
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>加载中...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>欢迎回来，{merchant?.username}！</h1>
          <p>这是您的商户管理仪表盘</p>
        </div>

        {/* API密钥显示 */}
        <div className="api-key-section">
          <h2>您的API密钥</h2>
          <div className="api-key-display">
            <div className="api-key-item">
              <label>API Key</label>
              <div className="key-box">
                <code>{merchant?.api_key}</code>
                <button
                  onClick={() => navigator.clipboard.writeText(merchant?.api_key)}
                  className="copy-btn"
                >
                  复制
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 今日统计 */}
        <div className="stats-section">
          <h2>今日统计</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <h3>今日订单</h3>
                <p className="stat-value">{stats?.today?.today_orders || 0}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <h3>成功订单</h3>
                <p className="stat-value">{stats?.today?.today_success || 0}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <h3>今日金额</h3>
                <p className="stat-value">¥{stats?.today?.today_amount?.toFixed(2) || '0.00'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 总体统计 */}
        <div className="stats-section">
          <h2>总体统计</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📈</div>
              <div className="stat-content">
                <h3>总订单数</h3>
                <p className="stat-value">{stats?.total?.total_orders || 0}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🎯</div>
              <div className="stat-content">
                <h3>成功订单</h3>
                <p className="stat-value">{stats?.total?.success_orders || 0}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">💵</div>
              <div className="stat-content">
                <h3>总金额</h3>
                <p className="stat-value">¥{stats?.total?.total_amount?.toFixed(2) || '0.00'}</p>
              </div>
            </div>

            <div className="stat-card success">
              <div className="stat-icon">💎</div>
              <div className="stat-content">
                <h3>成功金额</h3>
                <p className="stat-value">¥{stats?.total?.success_amount?.toFixed(2) || '0.00'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 快速操作 */}
        <div className="quick-actions">
          <h2>快速操作</h2>
          <div className="action-buttons">
            <button
              className="action-btn"
              onClick={() => navigate('/merchant/wallets')}
            >
              <span className="action-icon">👛</span>
              <span>管理钱包</span>
            </button>
            <button
              className="action-btn"
              onClick={() => navigate('/merchant/orders')}
            >
              <span className="action-icon">📋</span>
              <span>查看订单</span>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;

