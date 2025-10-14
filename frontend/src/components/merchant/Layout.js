import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import './Layout.css';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const merchant = JSON.parse(localStorage.getItem('merchant') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('merchant');
    navigate('/merchant/login');
  };

  const isAdmin = merchant.role === 'admin';

  const menuItems = isAdmin ? [
    { path: '/admin/dashboard', label: '系统概览', icon: '🖥️' },
    { path: '/admin/merchants', label: '商户管理', icon: '👥' },
    { path: '/admin/orders', label: '所有订单', icon: '📋' },
  ] : [
    { path: '/merchant/dashboard', label: '仪表盘', icon: '📊' },
    { path: '/merchant/wallets', label: '钱包管理', icon: '👛' },
    { path: '/merchant/orders', label: '订单列表', icon: '📋' },
    { path: '/merchant/test', label: '测试支付', icon: '🧪' },
  ];

  return (
    <div className="layout">
      <aside className={`sidebar ${isAdmin ? 'admin-sidebar' : ''}`}>
        <div className="sidebar-header">
          <h2>{isAdmin ? '🔐 管理后台' : '💳 支付管理'}</h2>
          <p className="merchant-name">{merchant.username}</p>
          {isAdmin && <span className="admin-badge">ADMIN</span>}
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <span>🚪</span>
            <span>退出登录</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="content-wrapper">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;

