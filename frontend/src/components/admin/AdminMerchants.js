import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/admin-api';
import Layout from '../merchant/Layout';
import './AdminMerchants.css';

const AdminMerchants = () => {
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMerchants();
  }, []);

  const loadMerchants = async () => {
    try {
      const response = await adminAPI.getAllMerchants();
      if (response.data.success) {
        setMerchants(response.data.data.filter(m => m.role !== 'admin'));
      }
    } catch (error) {
      console.error('Failed to load merchants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 1 ? 0 : 1;
    try {
      await adminAPI.updateMerchantStatus(id, newStatus);
      setMerchants(
        merchants.map((m) =>
          m.id === id ? { ...m, status: newStatus } : m
        )
      );
      alert('状态更新成功！');
    } catch (error) {
      alert('状态更新失败：' + (error.response?.data?.error || '未知错误'));
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
      <div className="admin-merchants">
        <div className="page-header admin">
          <div>
            <h1>商户管理</h1>
            <p>查看和管理所有商户账户</p>
          </div>
          <div className="stats-summary admin">
            <span>总商户: <strong>{merchants.length}</strong></span>
          </div>
        </div>

        <div className="merchants-table-container">
          <table className="merchants-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>用户名</th>
                <th>邮箱</th>
                <th>API Key</th>
                <th>状态</th>
                <th>注册时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {merchants.map((merchant) => (
                <tr key={merchant.id}>
                  <td className="merchant-id">{merchant.id}</td>
                  <td className="username">{merchant.username}</td>
                  <td className="email">{merchant.email}</td>
                  <td className="api-key">
                    <code>{merchant.api_key.substring(0, 16)}...</code>
                  </td>
                  <td>
                    <span className={`status-badge ${merchant.status === 1 ? 'active' : 'inactive'}`}>
                      {merchant.status === 1 ? '✅ 启用' : '❌ 禁用'}
                    </span>
                  </td>
                  <td className="date">
                    {new Date(merchant.created_at).toLocaleString('zh-CN')}
                  </td>
                  <td>
                    <button
                      className={`toggle-btn ${merchant.status === 1 ? 'disable' : 'enable'}`}
                      onClick={() => handleToggleStatus(merchant.id, merchant.status)}
                    >
                      {merchant.status === 1 ? '禁用' : '启用'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default AdminMerchants;

