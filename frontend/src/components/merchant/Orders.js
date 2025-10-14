import React, { useState, useEffect } from 'react';
import { merchantAPI } from '../../services/api';
import Layout from './Layout';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    loadOrders();
  }, [page]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await merchantAPI.getOrders({ page, page_size: pageSize });
      if (response.data.success) {
        setOrders(response.data.data.orders || []);
        setTotal(response.data.data.total || 0);
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 1:
        return '⏳ 等待支付';
      case 2:
        return '✅ 支付成功';
      case 3:
        return '❌ 已过期';
      default:
        return '未知状态';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 1:
        return 'pending';
      case 2:
        return 'success';
      case 3:
        return 'expired';
      default:
        return '';
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  if (loading && page === 1) {
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
      <div className="orders-page">
        <div className="page-header">
          <div>
            <h1>订单列表</h1>
            <p>查看和管理您的所有支付订单</p>
          </div>
          <div className="stats-summary">
            <span>总订单: <strong>{total}</strong></span>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>还没有订单</h3>
            <p>使用API Key创建支付订单后，订单会显示在这里</p>
          </div>
        ) : (
          <>
            <div className="orders-table-container">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>订单号</th>
                    <th>交易号</th>
                    <th>金额（CNY）</th>
                    <th>实付（USDT）</th>
                    <th>钱包地址</th>
                    <th>状态</th>
                    <th>创建时间</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="order-id">{order.order_id}</td>
                      <td className="trade-id">{order.trade_id}</td>
                      <td className="amount">¥{order.amount?.toFixed(2)}</td>
                      <td className="actual-amount">{order.actual_amount?.toFixed(4)} USDT</td>
                      <td className="wallet-address">
                        <code>{order.token?.substring(0, 10)}...{order.token?.substring(order.token.length - 6)}</code>
                      </td>
                      <td>
                        <span className={`status-badge ${getStatusClass(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </td>
                      <td className="date">
                        {new Date(order.created_at).toLocaleString('zh-CN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="page-btn"
                >
                  « 上一页
                </button>
                <span className="page-info">
                  第 {page} / {totalPages} 页
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="page-btn"
                >
                  下一页 »
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Orders;

