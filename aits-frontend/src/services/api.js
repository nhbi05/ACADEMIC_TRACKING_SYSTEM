// src/services/api.js
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
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

// Auth services
export const authService = {
  register: async (userData) => {
    const response = await api.post('/register/', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/login/', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
  },

  getCurrentUser: async () => {
    const response = await api.get('/users/me/');
    return response.data;
  },
};

// Issue services
export const issueService = {
  getAll: async () => {
    const response = await api.get('/issues/');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/issues/${id}/`);
    return response.data;
  },

  create: async (issueData) => {
    const response = await api.post('/issues/', issueData);
    return response.data;
  },

  assign: async (issueId, lecturerId) => {
    const response = await api.post(`/issues/${issueId}/assign/`, {
      lecturer_id: lecturerId,
    });
    return response.data;
  },

  resolve: async (issueId) => {
    const response = await api.post(`/issues/${issueId}/resolve/`);
    return response.data;
  },
};

// Notification services
export const notificationService = {
  getAll: async () => {
    const response = await api.get('/notifications/');
    return response.data;
  },

  markAsRead: async (notificationId) => {
    const response = await api.post(`/notifications/${notificationId}/mark-read/`);
    return response.data;
  },
};

export default api;