import axios from 'axios';

const API_BASE_URL = '/api';

// 创建axios实例
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token过期，清除并跳转到登录页
      localStorage.removeItem('token');
      localStorage.removeItem('merchant');
      window.location.href = '/merchant/login';
    }
    return Promise.reject(error);
  }
);

// 认证相关API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

// 商户相关API
export const merchantAPI = {
  getProfile: () => api.get('/merchant/profile'),
  getWallets: () => api.get('/merchant/wallets'),
  addWallet: (data) => api.post('/merchant/wallets', data),
  deleteWallet: (id) => api.delete(`/merchant/wallets/${id}`),
  getOrders: (params) => api.get('/merchant/orders', { params }),
  getStatistics: () => api.get('/merchant/statistics'),
};

// 支付相关API
export const paymentAPI = {
  createPayment: (data) => api.post('/payment/create', data),
  queryPayment: (orderId) => api.get(`/payment/query/${orderId}`),
};

export default api;

