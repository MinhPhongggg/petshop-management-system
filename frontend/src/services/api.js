import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

// Products API
export const productsApi = {
  getAll: (params) => api.get('/products', { params }),
  getAllAdmin: (params) => api.get('/products/admin/all', { params }), // Admin - lấy tất cả sản phẩm
  getById: (id) => api.get(`/products/${id}`),
  getBySlug: (slug) => api.get(`/products/slug/${slug}`),
  search: (keyword, params) => api.get('/products/search', { params: { keyword, ...params } }),
  filter: (params) => api.get('/products/filter', { params }),
  getByCategory: (categoryId, params) => api.get(`/products/category/${categoryId}`, { params }),
  getFeatured: () => api.get('/products/featured'),
  getBestSelling: (limit = 10) => api.get('/products/bestselling', { params: { limit } }),
  getNew: (limit = 10) => api.get('/products/new', { params: { limit } }),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  toggleActive: (id) => api.patch(`/products/${id}/toggle-active`),
  delete: (id) => api.delete(`/products/${id}`),
};

// Categories API
export const categoriesApi = {
  getAll: () => api.get('/categories'),
  getTree: () => api.get('/categories/tree'),
  getAdminTree: () => api.get('/categories/admin/tree'),
  getById: (id) => api.get(`/categories/${id}`),
  getBySlug: (slug) => api.get(`/categories/slug/${slug}`),
  getByPetType: (petType) => api.get(`/categories/pet-type/${petType}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

// Services API
export const servicesApi = {
  getActive: () => api.get('/services'),
  getById: (id) => api.get(`/services/${id}`),
  getBySlug: (slug) => api.get(`/services/slug/${slug}`),
  getAll: () => api.get('/services/all'),
  create: (data) => api.post('/services', data),
  update: (id, data) => api.put(`/services/${id}`, data),
  delete: (id) => api.delete(`/services/${id}`),
};

// Bookings API
export const bookingsApi = {
  create: (data) => api.post('/bookings', data),
  getMyBookings: (params) => api.get('/bookings/my-bookings', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  getByCode: (code) => api.get(`/bookings/code/${code}`),
  getPromotionProgress: (petId, serviceId) =>
    api.get("/bookings/promotion-progress", { params: { petId, serviceId } }),
  cancel: (id, reason) =>
    api.post(`/bookings/${id}/cancel`, null, { params: { reason } }),
  checkAvailability: (date, startTime, endTime) =>
    api.get("/bookings/check-availability", {
      params: { date, startTime, endTime },
    }),
  // Admin
  getAll: (params) => api.get('/bookings', { params }),
  getByDate: (date) => api.get(`/bookings/date/${date}`),
  getByStatus: (status, params) => api.get(`/bookings/status/${status}`, { params }),
  updateStatus: (id, newStatus, reason = 'Cập nhật bởi quản trị viên') => {
    switch (newStatus) {
      case 'CONFIRMED':
        return api.post(`/bookings/${id}/confirm`);
      case 'IN_PROGRESS':
        return api.post(`/bookings/${id}/start`);
      case 'COMPLETED':
        return api.post(`/bookings/${id}/complete`);
      case 'CANCELLED':
        return api.post(`/bookings/${id}/admin-cancel`, null, { params: { reason } });
      case 'NO_SHOW':
        return api.post(`/bookings/${id}/no-show`);
      default:
        return Promise.reject(new Error(`Unsupported booking status: ${newStatus}`));
    }
  },
  confirm: (id) => api.post(`/bookings/${id}/confirm`),
  start: (id) => api.post(`/bookings/${id}/start`),
  previewPayment: (id) => api.get(`/bookings/${id}/payment-preview`),
  pay: (id) => api.post(`/bookings/${id}/pay`),
  complete: (id, staffNote) =>
    api.post(`/bookings/${id}/complete`, null, { params: { staffNote } }),
  adminCancel: (id, reason) =>
    api.post(`/bookings/${id}/admin-cancel`, null, { params: { reason } }),
  markNoShow: (id) => api.post(`/bookings/${id}/no-show`),
  assignStaff: (id, staffId) => api.post(`/bookings/${id}/assign-staff`, null, { params: { staffId } }),
};

// Cart API
export const cartApi = {
  get: () => api.get('/cart'),
  add: (data) => api.post('/cart', data),
  update: (itemId, quantity) => api.put(`/cart/${itemId}`, null, { params: { quantity } }),
  remove: (itemId) => api.delete(`/cart/${itemId}`),
  clear: () => api.delete('/cart'),
};

// Orders API
export const ordersApi = {
  create: (data) => api.post('/orders', data),
  getMyOrders: (params) => api.get('/orders/my-orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  getByCode: (code) => api.get(`/orders/code/${code}`),
  cancel: (id, reason) => api.post(`/orders/${id}/cancel`, null, { params: { reason } }),
  // Admin
  getAll: (params) => api.get('/orders', { params }),
  getByStatus: (status, params) => api.get(`/orders/status/${status}`, { params }),
  confirm: (id) => api.post(`/orders/${id}/confirm`),
  process: (id) => api.post(`/orders/${id}/process`),
  ship: (id, trackingNumber) => api.post(`/orders/${id}/ship`, null, { params: { trackingNumber } }),
  deliver: (id) => api.post(`/orders/${id}/deliver`),
  complete: (id) => api.post(`/orders/${id}/complete`),
  adminCancel: (id, reason) => api.post(`/orders/${id}/admin-cancel`, null, { params: { reason } }),
  updatePaymentStatus: (id, status, transactionId) => 
    api.post(`/orders/${id}/payment-status`, null, { params: { status, transactionId } }),
};

// Vouchers API
export const vouchersApi = {
  getActive: () => api.get('/vouchers/active'),
  getAll: (params) => api.get('/vouchers', { params }),
  getById: (id) => api.get(`/vouchers/${id}`),
  getByCode: (code) => api.get(`/vouchers/code/${code}`),
  apply: (code, orderAmount) => api.post('/vouchers/apply', null, { params: { code, orderAmount } }),
  create: (data) => api.post('/vouchers', data),
  update: (id, data) => api.put(`/vouchers/${id}`, data),
  delete: (id) => api.delete(`/vouchers/${id}`),
  getUsageHistory: (id, params) => api.get(`/vouchers/${id}/usage-history`, { params }),
  saveVoucher: (id) => api.post(`/vouchers/save/${id}`),
  unsaveVoucher: (id) => api.delete(`/vouchers/unsave/${id}`),
  getMySaved: () => api.get('/vouchers/my-saved'),
};

// Rewards API
export const rewardsApi = {
  getMyProgress: () => api.get('/rewards/my-progress'),
  getTiers: () => api.get('/rewards/tiers'),
  getUserProgress: (userId) => api.get(`/rewards/user/${userId}`),
};

// ===== PAYMENTS API =====
export const paymentsApi = {
  mockMomo: (orderId) => api.post(`/payments/momo/${orderId}`),
  createMomoOrder: (orderId) => api.post(`/payments/momo/order/${orderId}/create`),
  // MoMo Booking Deposit
  createBookingDeposit: (bookingId) => api.post(`/payments/momo/booking/${bookingId}/deposit`),
  confirmMockDeposit: (bookingId) => api.post(`/payments/momo/booking/${bookingId}/confirm-mock`),
  refundDeposit: (bookingId, reason) => api.post(`/payments/momo/booking/${bookingId}/refund`, null, { params: { reason } }),
  getRedirectResult: (params) => api.get('/payments/momo/redirect', { params }),
};

// Pets API
export const petsApi = {
  getMyPets: () => api.get('/pets'),
  getById: (id) => api.get(`/pets/${id}`),
  create: (data) => api.post('/pets', data),
  update: (id, data) => api.put(`/pets/${id}`, data),
  delete: (id) => api.delete(`/pets/${id}`),
};

// Reviews API
export const reviewsApi = {
  getAll: (params) => api.get('/reviews', { params }),
  getByProduct: (productId, params) => api.get(`/reviews/product/${productId}`, { params }),
  create: (data) => api.post('/reviews', data),
  getMyReviews: (params) => api.get('/reviews/my-reviews', { params }),
  delete: (id) => api.delete(`/reviews/${id}`),
  // Admin endpoints
  replyToReview: (id, reply) => api.post(`/reviews/${id}/reply`, null, { params: { reply } }),
  hideReview: (id) => api.post(`/reviews/${id}/hide`),
  showReview: (id) => api.post(`/reviews/${id}/show`),
};

// Dashboard API (Admin)
export const dashboardApi = {
  getDashboard: () => api.get('/dashboard'),
  getDashboardByRange: (startDate, endDate) => api.get('/dashboard/range', { params: { startDate, endDate } }),
};

// Analytics API (Admin/Staff)
export const analyticsApi = {
  getFull: () => api.get('/analytics'),
  getFullAnalytics: () => api.get('/analytics'),
  getByRange: (startDate, endDate) => api.get('/analytics/range', { params: { startDate, endDate } }),
  getServices: (params) => api.get('/analytics/services', { params }),
  getInventory: () => api.get('/analytics/inventory'),
  getPets: () => api.get('/analytics/pets'),
};

// Spa Reminder API (Admin)
export const spaReminderApi = {
  sendAll: () => api.post('/spa-reminders/send'),
  sendOne: (bookingId) => api.post(`/spa-reminders/send/${bookingId}`),
  triggerReminders: () => api.post('/spa-reminders/send'),
  sendManualReminder: (bookingId) => api.post(`/spa-reminders/send/${bookingId}`),
  getLogs: (params) => api.get('/spa-reminders/logs', { params }),
  getStats: () => api.get('/spa-reminders/stats'),
  getEligible: () => api.get('/spa-reminders/eligible'),
};

// Users API (Admin)
export const usersApi = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  updateStatus: (id, status) => api.put(`/users/${id}/status`, null, { params: { status } }),
  delete: (id) => api.delete(`/users/${id}`),
};

// Import API (Admin)
export const importApi = {
  importProducts: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/import/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  downloadProductTemplate: () => api.get('/import/products/template', { responseType: 'blob' }),
};
