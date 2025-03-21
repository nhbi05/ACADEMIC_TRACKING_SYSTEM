// src/services/api.js - Enhanced API service with studentService added
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Track if we're refreshing the token
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access'); // Changed from 'accessToken'
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Change this line to match how you store the token
        const refreshToken = localStorage.getItem('refresh'); // Changed from 'refreshToken'
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await authService.refresh(refreshToken);
        // Make sure this matches the structure of your API response
        const newAccessToken = response.access;
        
        localStorage.setItem('access', newAccessToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        
        processQueue(null, newAccessToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Clear auth state if refresh fails
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
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
    return response.data; // Ensure this contains user, access, refresh
  },
  
  refresh: async (refreshToken) => {
    const response = await api.post('/token/refresh/', { refresh: refreshToken });
    return response.data;
  },

  logout: async () => {
    try {
      // Call backend logout endpoint
      await api.post('/logout/');
      // This endpoint should invalidate the refresh token on the server
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with frontend logout even if backend fails
    } finally {
      // Clear local storage regardless of backend response
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      delete api.defaults.headers.common['Authorization'];
    }
  }

  
};


  

// Student services - Added missing studentService
export const studentService = {
  getProfile: async () => {
    const response = await api.get('/student/profile/');
    return response.data;
  },
  // Add this new function
  getIssues: async () => {
    const response = await api.get('/my-issues/');
    return response.data;
  }
};

// Issue services
export const issueService = {
  getAll: async () => {
    const response = await api.get('/my-issues/');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/issues/${id}/`);
    return response.data;
  },

  create: async (issueData) => {
    const response = await api.post('/submit-issue/', issueData);
    return response.data;
  },
  
  assign: async (issueId, lecturerId) => {
    const response = await api.post(`/assign-issue/${issueId}/`, {
      lecturer_id: lecturerId,
    });
    return response.data;
  },
  
  resolve: async (issueId) => {
    const response = await api.post('/resolve-issue/', { issueId });
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