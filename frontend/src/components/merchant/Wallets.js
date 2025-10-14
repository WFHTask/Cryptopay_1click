import React, { useState, useEffect } from 'react';
import { merchantAPI } from '../../services/api';
import Layout from './Layout';
import './Wallets.css';

const Wallets = () => {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    wallet_address: '',
    wallet_name: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadWallets();
  }, []);

  const loadWallets = async () => {
    try {
      const response = await merchantAPI.getWallets();
      if (response.data.success) {
        setWallets(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load wallets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const response = await merchantAPI.addWallet(formData);
      if (response.data.success) {
        setWallets([...wallets, response.data.data]);
        setFormData({ wallet_address: '', wallet_name: '' });
        setShowAddForm(false);
        alert('钱包添加成功！');
      }
    } catch (err) {
      setError(err.response?.data?.error || '添加失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除这个钱包地址吗？')) {
      return;
    }

    try {
      await merchantAPI.deleteWallet(id);
      setWallets(wallets.filter((w) => w.id !== id));
      alert('删除成功！');
    } catch (error) {
      alert('删除失败：' + (error.response?.data?.error || '未知错误'));
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
      <div className="wallets-page">
        <div className="page-header">
          <div>
            <h1>钱包管理</h1>
            <p>管理您的USDT TRC20收款地址</p>
          </div>
          <button
            className="add-btn"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? '取消' : '+ 添加钱包'}
          </button>
        </div>

        {showAddForm && (
          <div className="add-wallet-form">
            <h3>添加新钱包</h3>
            <form onSubmit={handleAdd}>
              <div className="form-group">
                <label>钱包地址 *</label>
                <input
                  type="text"
                  value={formData.wallet_address}
                  onChange={(e) =>
                    setFormData({ ...formData, wallet_address: e.target.value })
                  }
                  placeholder="请输入USDT TRC20钱包地址"
                  required
                />
              </div>

              <div className="form-group">
                <label>钱包名称</label>
                <input
                  type="text"
                  value={formData.wallet_name}
                  onChange={(e) =>
                    setFormData({ ...formData, wallet_name: e.target.value })
                  }
                  placeholder="例如：主钱包"
                />
              </div>

              {error && <div className="error-message">{error}</div>}

              <button type="submit" className="submit-btn" disabled={submitting}>
                {submitting ? '添加中...' : '确认添加'}
              </button>
            </form>
          </div>
        )}

        <div className="wallets-list">
          {wallets.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👛</div>
              <h3>还没有钱包地址</h3>
              <p>点击"添加钱包"按钮添加您的USDT TRC20收款地址</p>
            </div>
          ) : (
            <div className="wallet-cards">
              {wallets.map((wallet) => (
                <div key={wallet.id} className="wallet-card">
                  <div className="wallet-info">
                    <div className="wallet-icon">💰</div>
                    <div className="wallet-details">
                      <h3>{wallet.wallet_name || '未命名钱包'}</h3>
                      <p className="wallet-address">{wallet.wallet_address}</p>
                      <span className={`wallet-status ${wallet.status === 1 ? 'active' : 'inactive'}`}>
                        {wallet.status === 1 ? '✅ 启用中' : '❌ 已禁用'}
                      </span>
                    </div>
                  </div>
                  <div className="wallet-actions">
                    <button
                      onClick={() => navigator.clipboard.writeText(wallet.wallet_address)}
                      className="action-btn copy"
                    >
                      复制地址
                    </button>
                    <button
                      onClick={() => handleDelete(wallet.id)}
                      className="action-btn delete"
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Wallets;

