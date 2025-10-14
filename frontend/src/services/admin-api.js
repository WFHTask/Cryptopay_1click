import api from './api';

// 管理员专用API
export const adminAPI = {
  getAllMerchants: () => api.get('/admin/merchants'),
  getAllOrders: (params) => api.get('/admin/orders', { params }),
  getAllWallets: () => api.get('/admin/wallets'),
  getSystemStatistics: () => api.get('/admin/statistics'),
  updateMerchantStatus: (id, status) => api.put(`/admin/merchants/${id}/status`, { status }),
};

export default adminAPI;

