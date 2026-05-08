import axios from 'axios';

const API_URL = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const api = {
  // Auth
  auth: {
    register: (data) => axios.post(`${API_URL}/auth/register`, data),
    login: (data) => axios.post(`${API_URL}/auth/login`, data),
    logout: () => axios.post(`${API_URL}/auth/logout`, {}, { headers: getAuthHeaders() }),
    me: () => axios.get(`${API_URL}/auth/me`, { headers: getAuthHeaders() }),
    forgotPassword: (data) => axios.post(`${API_URL}/auth/forgot-password`, data),
    resetPassword: (data) => axios.post(`${API_URL}/auth/reset-password`, data),
    updateProfile: (data) => axios.put(`${API_URL}/auth/profile`, data, { headers: getAuthHeaders() }),
    changePassword: (data) => axios.put(`${API_URL}/auth/change-password`, data, { headers: getAuthHeaders() }),
  },

  // Campaigns
  campaigns: {
    getAll: (params) => axios.get(`${API_URL}/campaigns`, { params, headers: getAuthHeaders() }),
    getFeatured: () => axios.get(`${API_URL}/campaigns/featured`),
    getById: (id) => axios.get(`${API_URL}/campaigns/${id}`, { headers: getAuthHeaders() }),
    create: (formData) => axios.post(`${API_URL}/campaigns`, formData, { headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' } }),
    update: (id, data) => axios.put(`${API_URL}/campaigns/${id}`, data, { headers: getAuthHeaders() }),
    updateWithImage: (id, formData) => axios.post(`${API_URL}/campaigns/${id}/update`, formData, { headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' } }),
    delete: (id) => axios.delete(`${API_URL}/campaigns/${id}`, { headers: getAuthHeaders() }),
  },

  // Student Requests
  requests: {
    getAll: (params) => axios.get(`${API_URL}/requests`, { params, headers: getAuthHeaders() }),
    getStats: () => axios.get(`${API_URL}/requests/stats`, { headers: getAuthHeaders() }),
    getById: (id) => axios.get(`${API_URL}/requests/${id}`, { headers: getAuthHeaders() }),
    create: (formData) => axios.post(`${API_URL}/requests`, formData, { headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' } }),
    update: (id, data) => axios.put(`${API_URL}/requests/${id}`, data, { headers: getAuthHeaders() }),
    updateStatus: (id, data) => axios.put(`${API_URL}/requests/${id}/status`, data, { headers: getAuthHeaders() }),
    delete: (id) => axios.delete(`${API_URL}/requests/${id}`, { headers: getAuthHeaders() }),
    uploadDocuments: (id, formData) => axios.post(`${API_URL}/requests/${id}/documents`, formData, { headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' } }),
  },

  // Donations
  donations: {
    getAll: (params) => axios.get(`${API_URL}/donations`, { params, headers: getAuthHeaders() }),
    getStats: () => axios.get(`${API_URL}/donations/stats`, { headers: getAuthHeaders() }),
    getById: (id) => axios.get(`${API_URL}/donations/${id}`, { headers: getAuthHeaders() }),
    initialize: (data) => axios.post(`${API_URL}/donations/initialize`, data, { headers: getAuthHeaders() }),
    verify: (reference) => axios.post(`${API_URL}/donations/verify`, { reference }, { headers: getAuthHeaders() }),
    history: (params) => axios.get(`${API_URL}/donations/history`, { params, headers: getAuthHeaders() }),
  },

  // Notifications
  notifications: {
    getAll: (params) => axios.get(`${API_URL}/notifications`, { params, headers: getAuthHeaders() }),
    getUnreadCount: () => axios.get(`${API_URL}/notifications/unread-count`, { headers: getAuthHeaders() }),
    markRead: (id) => axios.put(`${API_URL}/notifications/${id}/read`, {}, { headers: getAuthHeaders() }),
    markAllRead: () => axios.put(`${API_URL}/notifications/read-all`, {}, { headers: getAuthHeaders() }),
    delete: (id) => axios.delete(`${API_URL}/notifications/${id}`, { headers: getAuthHeaders() }),
  },

  // Public Stats
  stats: {
    getPublic: () => axios.get(`${API_URL}/stats/public`),
  },

  // Admin
  admin: {
    getStats: () => axios.get(`${API_URL}/admin/stats`, { headers: getAuthHeaders() }),
    getUsers: (params) => axios.get(`${API_URL}/admin/users`, { params, headers: getAuthHeaders() }),
    verifyUser: (id) => axios.put(`${API_URL}/admin/users/${id}/verify`, {}, { headers: getAuthHeaders() }),
    toggleUserStatus: (id) => axios.put(`${API_URL}/admin/users/${id}/toggle-status`, {}, { headers: getAuthHeaders() }),
    deleteUser: (id) => axios.delete(`${API_URL}/admin/users/${id}`, { headers: getAuthHeaders() }),
    getActivityLogs: (params) => axios.get(`${API_URL}/admin/activity-logs`, { params, headers: getAuthHeaders() }),
    getReports: (params) => axios.get(`${API_URL}/admin/reports`, { params, headers: getAuthHeaders() }),
    getSettings: () => axios.get(`${API_URL}/admin/settings`, { headers: getAuthHeaders() }),
    updateSettings: (data) => axios.put(`${API_URL}/admin/settings`, data, { headers: getAuthHeaders() }),
  },
};

export default api;
