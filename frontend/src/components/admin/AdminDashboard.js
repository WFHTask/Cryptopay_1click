import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/admin-api';
import Layout from '../merchant/Layout';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await adminAPI.getSystemStatistics();
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
      <div className="admin-dashboard">
        <div className="admin-header">
          <h1>系统管理面板</h1>
          <p>查看系统全局数据和商户信息</p>
        </div>

        {/* 系统统计 */}
        <div className="stats-section">
          <h2>系统概览</h2>
          <div className="stats-grid">
            <div className="stat-card admin">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <h3>总商户数</h3>
                <p className="stat-value">{stats?.system?.total_merchants || 0}</p>
              </div>
            </div>

            <div className="stat-card admin">
              <div className="stat-icon">👛</div>
              <div className="stat-content">
                <h3>总钱包数</h3>
                <p className="stat-value">{stats?.system?.total_wallets || 0}</p>
              </div>
            </div>

            <div className="stat-card admin">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <h3>总订单数</h3>
                <p className="stat-value">{stats?.system?.total_orders || 0}</p>
              </div>
            </div>

            <div className="stat-card admin">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <h3>成功订单</h3>
                <p className="stat-value">{stats?.system?.success_orders || 0}</p>
              </div>
            </div>

            <div className="stat-card admin success">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <h3>总交易额</h3>
                <p className="stat-value">¥{stats?.system?.total_amount?.toFixed(2) || '0.00'}</p>
              </div>
            </div>

            <div className="stat-card admin success">
              <div className="stat-icon">💎</div>
              <div className="stat-content">
                <h3>成功金额</h3>
                <p className="stat-value">¥{stats?.system?.success_amount?.toFixed(2) || '0.00'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 商户排行 */}
        <div className="merchants-ranking">
          <h2>商户排行榜</h2>
          <div className="ranking-table">
            <table>
              <thead>
                <tr>
                  <th>排名</th>
                  <th>商户名称</th>
                  <th>总订单</th>
                  <th>成功订单</th>
                  <th>总金额</th>
                  <th>成功金额</th>
                  <th>成功率</th>
                </tr>
              </thead>
              <tbody>
                {stats?.merchants?.map((merchant, index) => (
                  <tr key={merchant.merchant_id}>
                    <td className="rank">
                      {index === 0 && '🥇'}
                      {index === 1 && '🥈'}
                      {index === 2 && '🥉'}
                      {index > 2 && `#${index + 1}`}
                    </td>
                    <td className="merchant-name">{merchant.username}</td>
                    <td>{merchant.order_count}</td>
                    <td className="success">{merchant.success_count}</td>
                    <td>¥{merchant.total_amount?.toFixed(2)}</td>
                    <td className="success-amount">¥{merchant.success_amount?.toFixed(2)}</td>
                    <td className="rate">
                      {merchant.order_count > 0
                        ? ((merchant.success_count / merchant.order_count) * 100).toFixed(1)
                        : '0.0'}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;

