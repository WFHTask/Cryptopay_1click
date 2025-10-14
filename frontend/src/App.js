import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import PaymentForm from './components/PaymentForm';
import PaymentPage from './components/PaymentPage';
import PaymentSuccess from './components/PaymentSuccess';
import Login from './components/merchant/Login';
import Register from './components/merchant/Register';
import Dashboard from './components/merchant/Dashboard';
import Wallets from './components/merchant/Wallets';
import Orders from './components/merchant/Orders';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminMerchants from './components/admin/AdminMerchants';
import AdminOrders from './components/admin/AdminOrders';
import EmbedPayment from './components/EmbedPayment';
import MatrixBackground from './components/MatrixBackground';
import './App.css';

// 受保护的路由组件
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/merchant/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <MatrixBackground />
      <div className="App">
        <Routes>
          {/* 首页 - 落地页 */}
          <Route path="/" element={<LandingPage />} />
          
          {/* 公开支付页面 */}
          <Route path="/payment/create" element={<PaymentForm />} />
          <Route path="/payment/:orderId" element={<PaymentPage />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          
          {/* 嵌入式支付页面 */}
          <Route path="/embed/payment/:tradeId" element={<EmbedPayment />} />

          {/* 商户认证页面 */}
          <Route path="/merchant/login" element={<Login />} />
          <Route path="/merchant/register" element={<Register />} />

          {/* 商户管理页面（需要认证） */}
          <Route
            path="/merchant/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/merchant/wallets"
            element={
              <ProtectedRoute>
                <Wallets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/merchant/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />

          {/* 管理员页面（需要认证和管理员权限） */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/merchants"
            element={
              <ProtectedRoute>
                <AdminMerchants />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute>
                <AdminOrders />
              </ProtectedRoute>
            }
          />

          {/* 默认重定向 */}
          <Route path="/merchant" element={<Navigate to="/merchant/dashboard" replace />} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

