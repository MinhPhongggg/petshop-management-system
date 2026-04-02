import axios from "axios";
import { useAuthStore } from "../store/authStore";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    const requestUrl = config.url || "";
    const isPublicAuthEndpoint =
      requestUrl.startsWith("/auth/login") ||
      requestUrl.startsWith("/auth/register");

    if (token && !isPublicAuthEndpoint) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || "";
      const isPublicAuthEndpoint =
        requestUrl.startsWith("/auth/login") ||
        requestUrl.startsWith("/auth/register");

      // Token expired or invalid (avoid redirect loops on login/register)
      if (!isPublicAuthEndpoint) {
        const store = useAuthStore.getState();
        // Only logout if we were previously authenticated (avoid loop on fresh load)
        if (store.isAuthenticated) {
          store.logout();
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  },
);

export default api;

// Auth API
export const authApi = {
  login: (data) => api.post("/auth/login", data),
  register: (data) => api.post("/auth/register", data),
  getMe: () => api.get("/auth/me"),
  logout: () => api.post("/auth/logout"),
  updateProfile: (data) => api.put("/auth/profile", data),
  changePassword: (data) => api.put("/auth/change-password", data),
};

// Products API
export const productsApi = {
  getAll: (params) => api.get("/products", { params }),
  getAllAdmin: (params) => api.get("/products/admin/all", { params }), // Admin - lấy tất cả sản phẩm
  getById: (id) => api.get(`/products/${id}`),
  getBySlug: (slug) => api.get(`/products/slug/${slug}`),
  search: (keyword, params) =>
    api.get("/products/search", { params: { keyword, ...params } }),
  filter: (params) => api.get("/products/filter", { params }),
  getByCategory: (categoryId, params) =>
    api.get(`/products/category/${categoryId}`, { params }),
  getFeatured: () => api.get("/products/featured"),
  getBestSelling: (limit = 10) =>
    api.get("/products/bestselling", { params: { limit } }),
  getNew: (limit = 10) => api.get("/products/new", { params: { limit } }),
  create: (data) => api.post("/products", data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

// Categories API
export const categoriesApi = {
  getAll: () => api.get("/categories"),
  getTree: () => api.get("/categories/tree"),
  getById: (id) => api.get(`/categories/${id}`),
  getBySlug: (slug) => api.get(`/categories/slug/${slug}`),
  getByPetType: (petType) => api.get(`/categories/pet-type/${petType}`),
  create: (data) => api.post("/categories", data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

// Services API
export const servicesApi = {
  getActive: () => api.get("/services"),
  getById: (id) => api.get(`/services/${id}`),
  getBySlug: (slug) => api.get(`/services/slug/${slug}`),
  getAll: () => api.get("/services/all"),
  create: (data) => api.post("/services", data),
  update: (id, data) => api.put(`/services/${id}`, data),
  toggleActive: (id) => api.patch(`/services/${id}/toggle-active`),
  delete: (id) => api.delete(`/services/${id}`),
};

// Bookings API
export const bookingsApi = {
  create: (data) => api.post("/bookings", data),
  getMyBookings: (params) => api.get("/bookings/my-bookings", { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  getByCode: (code) => api.get(`/bookings/code/${code}`),
  cancel: (id, reason) =>
    api.post(`/bookings/${id}/cancel`, null, { params: { reason } }),
  checkAvailability: (date, startTime, endTime) =>
    api.get("/bookings/check-availability", {
      params: { date, startTime, endTime },
    }),
  // Admin
  getAll: (params) => api.get("/bookings", { params }),
  getByDate: (date) => api.get(`/bookings/date/${date}`),
  getByStatus: (status, params) =>
    api.get(`/bookings/status/${status}`, { params }),
  confirm: (id) => api.post(`/bookings/${id}/confirm`),
  start: (id) => api.post(`/bookings/${id}/start`),
  complete: (id, staffNote) =>
    api.post(`/bookings/${id}/complete`, null, { params: { staffNote } }),
  adminCancel: (id, reason) =>
    api.post(`/bookings/${id}/admin-cancel`, null, { params: { reason } }),
  markNoShow: (id) => api.post(`/bookings/${id}/no-show`),
  assignStaff: (id, staffId) =>
    api.post(`/bookings/${id}/assign-staff`, null, { params: { staffId } }),
};

// Cart API
export const cartApi = {
  get: () => api.get("/cart"),
  // Backend expects { variantId, quantity }
  add: ({ variantId, quantity }) => api.post("/cart", { variantId, quantity }),
  update: (itemId, quantity) =>
    api.put(`/cart/${itemId}`, null, { params: { quantity } }),
  remove: (itemId) => api.delete(`/cart/${itemId}`),
  clear: () => api.delete("/cart"),
};

// Orders API
export const ordersApi = {
  create: (data) => api.post("/orders", data),
  getMyOrders: (params) => api.get("/orders/my-orders", { params }),
  getById: (id) => api.get(`/orders/${id}`),
  getByCode: (code) => api.get(`/orders/code/${code}`),
  cancel: (id, reason) =>
    api.post(`/orders/${id}/cancel`, null, { params: { reason } }),
  confirmReceived: (id) => api.post(`/orders/${id}/confirm-received`),
  // Admin
  getAll: (params) => api.get("/orders", { params }),
  getByStatus: (status, params) =>
    api.get(`/orders/status/${status}`, { params }),
  confirm: (id) => api.post(`/orders/${id}/confirm`),
  process: (id) => api.post(`/orders/${id}/process`),
  ship: (id, trackingNumber) =>
    api.post(`/orders/${id}/ship`, null, { params: { trackingNumber } }),
  deliver: (id) => api.post(`/orders/${id}/deliver`),
  complete: (id) => api.post(`/orders/${id}/complete`),
  adminCancel: (id, reason) =>
    api.post(`/orders/${id}/admin-cancel`, null, { params: { reason } }),
  updatePaymentStatus: (id, status, transactionId) =>
    api.post(`/orders/${id}/payment-status`, null, {
      params: { status, transactionId },
    }),
  updateStatus: (id, status, extra = {}) => {
    const normalized = String(status || "").toUpperCase();
    switch (normalized) {
      case "CONFIRMED":
        return api.post(`/orders/${id}/confirm`);
      case "PROCESSING":
        return api.post(`/orders/${id}/process`);
      case "SHIPPING":
        return api.post(`/orders/${id}/ship`, null, {
          params: { trackingNumber: extra.trackingNumber },
        });
      case "DELIVERED":
        return api.post(`/orders/${id}/deliver`);
      case "COMPLETED":
        return api.post(`/orders/${id}/complete`);
      case "CANCELLED":
        return api.post(`/orders/${id}/admin-cancel`, null, {
          params: { reason: extra.reason || "Hủy bởi quản trị viên" },
        });
      default:
        throw new Error(`Unsupported status update: ${normalized}`);
    }
  },
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
  getMyPets: () => api.get("/pets"),
  getById: (id) => api.get(`/pets/${id}`),
  create: (data) => api.post("/pets", data),
  update: (id, data) => api.put(`/pets/${id}`, data),
  delete: (id) => api.delete(`/pets/${id}`),
};

// Reviews API
export const reviewsApi = {
  getByProduct: (productId, params) =>
    api.get(`/reviews/product/${productId}`, { params }),
  create: (data) => api.post("/reviews", data),
  getMyReviews: (params) => api.get("/reviews/my-reviews", { params }),
  update: (id, data) => api.put(`/reviews/${id}`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
  // Admin endpoints
  getAll: (params) => api.get("/reviews", { params }),
  replyToReview: (id, reply) =>
    api.post(`/reviews/${id}/reply`, null, { params: { reply } }),
  hideReview: (id) => api.post(`/reviews/${id}/hide`),
  showReview: (id) => api.post(`/reviews/${id}/show`),
};

// Dashboard API (Admin)
export const dashboardApi = {
  getDashboard: () => api.get("/dashboard"),
  getDashboardByRange: (startDate, endDate) =>
    api.get("/dashboard/range", { params: { startDate, endDate } }),
};

// Analytics API (Admin) - Thống kê & Báo cáo nâng cao
export const analyticsApi = {
  getFullAnalytics: () => api.get("/analytics"),
  getFullAnalyticsByRange: (startDate, endDate) =>
    api.get("/analytics/range", { params: { startDate, endDate } }),
  getServiceAnalytics: (startDate, endDate) =>
    api.get("/analytics/services", { params: { startDate, endDate } }),
  getInventoryAnalytics: () => api.get("/analytics/inventory"),
  getPetAnalytics: () => api.get("/analytics/pets"),
};

// Reports API (Admin)
export const reportsApi = {
  getBusinessReport: (startDate, endDate, topLimit = 10) =>
    api.get('/reports/business', { params: { startDate, endDate, topLimit } }),
  exportBusinessExcel: (startDate, endDate, topLimit = 10) =>
    api.get('/reports/business/export/excel', { params: { startDate, endDate, topLimit }, responseType: 'blob' }),
  exportBusinessPdf: (startDate, endDate, topLimit = 10) =>
    api.get('/reports/business/export/pdf', { params: { startDate, endDate, topLimit }, responseType: 'blob' }),
  drilldownOrders: (startDate, endDate) =>
    api.get('/reports/business/drilldown/orders', { params: { startDate, endDate } }),
};

// Vouchers API
export const vouchersApi = {
  // Public
  getActive: () => api.get("/vouchers/active"),
  getByCode: (code) => api.get(`/vouchers/code/${code}`),
  apply: (code, orderAmount) =>
    api.post("/vouchers/apply", null, { params: { code, orderAmount } }),
  // Customer wallet
  saveVoucher: (id) => api.post(`/vouchers/save/${id}`),
  unsaveVoucher: (id) => api.delete(`/vouchers/unsave/${id}`),
  getMySaved: () => api.get("/vouchers/my-saved"),
  // Admin
  getAll: (params) => api.get("/vouchers", { params }),
  getById: (id) => api.get(`/vouchers/${id}`),
  create: (data) => api.post("/vouchers", data),
  update: (id, data) => api.put(`/vouchers/${id}`, data),
  delete: (id) => api.delete(`/vouchers/${id}`),
  getUsageHistory: (id, params) =>
    api.get(`/vouchers/${id}/usage-history`, { params }),
};

// Users API (Admin)
export const usersApi = {
  getAll: (params) => api.get("/users", { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  updateRole: (id, role) =>
    api.put(`/users/${id}/role`, null, { params: { role } }),
  updateStatus: (id, status) =>
    api.put(`/users/${id}/status`, null, { params: { status } }),
  delete: (id) => api.delete(`/users/${id}`),
};

// Rewards API
export const rewardsApi = {
  getMyProgress: () => api.get('/rewards/my-progress'),
  getMyPoints: () => api.get('/rewards/my-points'),
  requestViewPointsCode: () => api.post('/rewards/my-points/request-code'),
  verifyViewPointsCode: (verificationCode) =>
    api.post('/rewards/my-points/verify', { verificationCode }),
  getTiers: () => api.get('/rewards/tiers'),
  getUserProgress: (userId) => api.get(`/rewards/user/${userId}`),
  claimWatchVoucher: (productId, watchedSeconds) =>
    api.post('/rewards/vouchers/watch-product', { productId, watchedSeconds }),
  requestRedeemCode: (pointsToRedeem) =>
    api.post('/rewards/vouchers/redeem/request-code', { pointsToRedeem }),
  confirmRedeemPoints: (pointsToRedeem, verificationCode) =>
    api.post('/rewards/vouchers/redeem/confirm', { pointsToRedeem, verificationCode }),
};

// Suppliers API (Admin)
export const suppliersApi = {
  getAll: (params) => api.get('/suppliers', { params }),
  getActive: () => api.get('/suppliers/active'),
  getById: (id) => api.get(`/suppliers/${id}`),
  create: (data) => api.post('/suppliers', data),
  update: (id, data) => api.put(`/suppliers/${id}`, data),
  toggleActive: (id) => api.patch(`/suppliers/${id}/toggle-active`),
  delete: (id) => api.delete(`/suppliers/${id}`),
};

// Inventory API (Admin)
export const inventoryApi = {
  importStock: (data) => api.post('/inventory/import', data),
  exportStock: (data) => api.post('/inventory/export', data),
  adjustStock: (data) => api.post('/inventory/adjust', data),
  getMovements: (variantId, params) => api.get(`/inventory/movements/${variantId}`, { params }),
  getLowStock: () => api.get('/inventory/low-stock'),
  getOutOfStock: () => api.get('/inventory/out-of-stock'),
  getOverStock: () => api.get('/inventory/over-stock'),
  getExpiring: () => api.get('/inventory/expiring'),
};

// Stock Audits API (Admin)
export const stockAuditsApi = {
  getAll: (params) => api.get('/stock-audits', { params }),
  getById: (id) => api.get(`/stock-audits/${id}`),
  create: (data) => api.post('/stock-audits', data),
  start: (id) => api.post(`/stock-audits/${id}/start`),
  updateCounts: (id, data) => api.put(`/stock-audits/${id}/counts`, data),
  complete: (id) => api.post(`/stock-audits/${id}/complete`),
  cancel: (id) => api.post(`/stock-audits/${id}/cancel`),
  delete: (id) => api.delete(`/stock-audits/${id}`),
};

// Purchase Orders API (Admin)
export const purchaseOrdersApi = {
  getAll: (params) => api.get('/purchase-orders', { params }),
  getByStatus: (status, params) => api.get(`/purchase-orders/status/${status}`, { params }),
  getById: (id) => api.get(`/purchase-orders/${id}`),
  create: (data) => api.post('/purchase-orders', data),
  update: (id, data) => api.put(`/purchase-orders/${id}`, data),
  submit: (id) => api.post(`/purchase-orders/${id}/submit`),
  approve: (id) => api.post(`/purchase-orders/${id}/approve`),
  receive: (id) => api.post(`/purchase-orders/${id}/receive`),
  cancel: (id) => api.post(`/purchase-orders/${id}/cancel`),
  delete: (id) => api.delete(`/purchase-orders/${id}`),
};

// Import API (Admin)
export const importApi = {
  importProducts: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/import/products", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  downloadProductTemplate: () =>
    api.get("/import/products/template", { responseType: "blob" }),
};
