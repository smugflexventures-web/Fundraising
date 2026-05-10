import axios from 'axios';

const API_URL = '/api';

// Centralized axios instance with automatic token injection and 401 handling
const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach Authorization header from localStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Send method override header for PUT/DELETE so cPanel/Apache proxies correctly
    if (['put', 'delete', 'patch'].includes(config.method?.toLowerCase())) {
      config.headers['X-HTTP-Method-Override'] = config.method.toUpperCase();
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: auto-logout on 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Only redirect if not already on login/register pages
      if (!window.location.pathname.match(/^\/(login|register|forgot-password|reset-password)/)) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

const api = {
  // Auth
  auth: {
    register: (data) => apiClient.post('/auth/register', data),
    login: (data) => apiClient.post('/auth/login', data),
    logout: () => apiClient.post('/auth/logout'),
    me: () => apiClient.get('/auth/me'),
    forgotPassword: (data) => apiClient.post('/auth/forgot-password', data),
    resetPassword: (data) => apiClient.post('/auth/reset-password', data),
    updateProfile: (data) => apiClient.post('/auth/profile', data),
    changePassword: (data) => apiClient.post('/auth/change-password', data),
  },

  // Campaigns
  campaigns: {
    getAll: (params) => apiClient.get('/campaigns', { params }),
    getFeatured: () => apiClient.get('/campaigns/featured'),
    getById: (id) => apiClient.get(`/campaigns/${id}`),
    create: (formData) => apiClient.post('/campaigns', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    update: (id, data) => apiClient.post(`/campaigns/${id}/edit`, data),
    updateWithImage: (id, formData) => apiClient.post(`/campaigns/${id}/update`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    delete: (id) => apiClient.post(`/campaigns/${id}/delete`),
  },

  // Student Requests
  requests: {
    getAll: (params) => apiClient.get('/requests', { params }),
    getStats: () => apiClient.get('/requests/stats'),
    getById: (id) => apiClient.get(`/requests/${id}`),
    create: (formData) => apiClient.post('/requests', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    update: (id, data) => apiClient.post(`/requests/${id}/update`, data),
    updateStatus: (id, data) => apiClient.post(`/requests/${id}/status`, data),
    delete: (id) => apiClient.post(`/requests/${id}/delete`),
    uploadDocuments: (id, formData) => apiClient.post(`/requests/${id}/documents`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  },

  // Donations
  donations: {
    getAll: (params) => apiClient.get('/donations', { params }),
    getStats: () => apiClient.get('/donations/stats'),
    getById: (id) => apiClient.get(`/donations/${id}`),
    initialize: (data) => apiClient.post('/donations/initialize', data),
    verify: (reference) => apiClient.post('/donations/verify', { reference }),
    history: (params) => apiClient.get('/donations/history', { params }),
  },

  // Bank Transfer
  bankTransfer: {
    getBankDetails: () => apiClient.get('/bank-transfer/details'),
    initialize: (data) => apiClient.post('/bank-transfer/initialize', data),
    submitProof: (donationId, formData) => apiClient.post(`/bank-transfer/${donationId}/submit-proof`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    getPending: (params) => apiClient.get('/bank-transfer/pending', { params }),
    verify: (id) => apiClient.post(`/bank-transfer/${id}/verify`),
    reject: (id, data) => apiClient.post(`/bank-transfer/${id}/reject`, data),
  },

  // Notifications
  notifications: {
    getAll: (params) => apiClient.get('/notifications', { params }),
    getUnreadCount: () => apiClient.get('/notifications/unread-count'),
    markRead: (id) => apiClient.post(`/notifications/${id}/read`),
    markAllRead: () => apiClient.post('/notifications/read-all'),
    delete: (id) => apiClient.post(`/notifications/${id}/delete`),
  },

  // Public Stats
  stats: {
    getPublic: () => apiClient.get('/stats/public'),
  },

  // Admin
  admin: {
    getStats: () => apiClient.get('/admin/stats'),
    getUsers: (params) => apiClient.get('/admin/users', { params }),
    verifyUser: (id) => apiClient.post(`/admin/users/${id}/verify`),
    toggleUserStatus: (id) => apiClient.post(`/admin/users/${id}/toggle-status`),
    deleteUser: (id) => apiClient.post(`/admin/users/${id}/delete`),
    getActivityLogs: (params) => apiClient.get('/admin/activity-logs', { params }),
    getReports: (params) => apiClient.get('/admin/reports', { params }),
    getSettings: () => apiClient.get('/admin/settings'),
    updateSettings: (data) => apiClient.post('/admin/settings', data),
  },
};

export default api;
