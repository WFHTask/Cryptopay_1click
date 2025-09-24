import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  Paper, 
  TextField,
  IconButton,
  Tooltip
} from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { AuthProvider } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import PaymentPage from './pages/PaymentPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import EmbedPaymentPage from './pages/EmbedPaymentPage';
import EmbedCodeGeneratorPage from './pages/EmbedCodeGeneratorPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminMiddlemanPage from './pages/AdminMiddlemanPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import { geekTheme, lightGeekTheme } from './theme';

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const theme = darkMode ? geekTheme : lightGeekTheme;

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LanguageProvider>
        <AuthProvider>
          <Box sx={{ position: 'fixed', top: 16, right: 16, zIndex: 1000 }}>
            <Tooltip title={darkMode ? "切换到浅色模式" : "切换到深色模式"}>
              <IconButton onClick={toggleTheme} color="inherit" sx={{ 
                bgcolor: 'rgba(0, 255, 136, 0.1)', 
                border: '1px solid rgba(0, 255, 136, 0.3)',
                '&:hover': {
                  bgcolor: 'rgba(0, 255, 136, 0.2)',
                  borderColor: 'rgba(0, 255, 136, 0.5)',
                }
              }}>
                {darkMode ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
            </Tooltip>
          </Box>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            } />
            <Route path="/embed" element={
              <PrivateRoute>
                <EmbedCodeGeneratorPage />
              </PrivateRoute>
            } />
            <Route path="/pay/:linkId" element={<PaymentPage />} />
            <Route path="/embed/pay/:linkId" element={<EmbedPaymentPage />} />
            <Route path="/payment/success/:orderId" element={<PaymentSuccessPage />} />
            
            {/* 管理员路由 */}
            <Route path="/admin" element={
              <AdminRoute>
                <AdminDashboardPage />
              </AdminRoute>
            } />
            <Route path="/admin/users" element={
              <AdminRoute>
                <AdminUsersPage />
              </AdminRoute>
            } />
            <Route path="/admin/orders" element={
              <AdminRoute>
                <AdminOrdersPage />
              </AdminRoute>
            } />
            <Route path="/admin/middleman" element={
              <AdminRoute>
                <AdminMiddlemanPage />
              </AdminRoute>
            } />
            <Route path="/admin/settings" element={
              <AdminRoute>
                <AdminSettingsPage />
              </AdminRoute>
            } />
          </Routes>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;