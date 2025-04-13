// src/services/api.js - Complete implementation with JWT authentication
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

// Create main API instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Separate instance for token refresh to avoid interceptor loops
const tokenApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// For handling multiple concurrent requests during token refresh
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

// Add access token to every request
api.interceptors.request.use(
  (config) => {
    console.log('Making request to:', config.baseURL + config.url);
    const token = localStorage.getItem('access');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is 401 and we haven't tried refreshing yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If already refreshing, queue this request
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
        const refreshToken = localStorage.getItem('refresh');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Use tokenApi to avoid interceptors
        const response = await tokenApi.post('token/refresh/', { 
          refresh: refreshToken 
        });
        
        const newAccessToken = response.data.access;
        
        // Update localStorage and default headers
        localStorage.setItem('access', newAccessToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        
        // Process all queued requests with new token
        processQueue(null, newAccessToken);
        
        // Retry the original request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear auth but don't redirect - let app handle it
        processQueue(refreshError, null);
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
        return Promise.reject(new Error('Session expired'));
      } finally {
        isRefreshing = false;
      }
    }
    
    // For all other errors, just reject
    return Promise.reject(error);
  }
);

// Auth service
export const authService = {
  register: async (userData) => {
    const response = await api.post('/register/', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/login/', credentials);
    // Store tokens
    if (response.data.access && response.data.refresh) {
      localStorage.setItem('access', response.data.access);
      localStorage.setItem('refresh', response.data.refresh);
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
      
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    }
    return response.data;
  },
  
  refresh: async (refreshToken) => {
    const response = await tokenApi.post('/refresh/', { 
      refresh: refreshToken 
    });
    return response.data;
  },
  
  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('refresh');
      if (refreshToken) {
        await api.post('/logout/', { refresh: refreshToken });
      }
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with local logout even if API fails
    } finally {
      // Clear tokens from storage
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      localStorage.removeItem('user');
      // Remove auth header
      delete api.defaults.headers.common['Authorization'];
    }
  },
  
  // Helper method to store auth tokens - compatible with the new approach
  setAuthTokens: (tokens) => {
    localStorage.setItem('access', tokens.access);
    localStorage.setItem('refresh', tokens.refresh);
    api.defaults.headers.common['Authorization'] = `Bearer ${tokens.access}`;
  },
  
  // Proactively check and refresh token if needed
  checkTokenExpiration: async () => {
    const token = localStorage.getItem('access');
    if (!token) return false;
    
    // Decode token to check expiration
    try {
      // Simple parsing of JWT payload (no validation)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      
      // If token expires in less than 5 minutes, refresh it
      if (expiry - now < 5 * 60 * 1000) {
        const refreshToken = localStorage.getItem('refresh');
        if (!refreshToken) return false;
        
        try {
          const response = await authService.refresh(refreshToken);
          authService.setAuthTokens({
            access: response.access,
            refresh: response.refresh || refreshToken // Keep existing if not provided
          });
          return true;
        } catch (error) {
          console.error('Proactive refresh failed:', error);
          // Don't logout here - let the interceptor handle it when needed
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error('Token decode error:', error);
      return false;
    }
  },
  
  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('access');
  },
  
  // Get current user data
  getCurrentUser: () => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch (error) {
      return null;
    }
  }
};
export const studentService = {
  getProfile: async () => {
    await authService.checkTokenExpiration();
    const response = await api.get('/student/profile/');
    return response.data;
  },
  
  getIssues: async () => {
    await authService.checkTokenExpiration();
    const response = await api.get('/my-issues/');
    return response.data;
  },
  
  // Add the createIssue method
  createIssue: async (issueData) => {
    await authService.checkTokenExpiration();
    const response = await api.post('/submit-issue/', issueData);
    return response.data;
  }
};

// Issue services

// Notification services
export const notificationService = {
  getAll: async () => {
    await authService.checkTokenExpiration();
    const response = await api.get('/notifications/');
    return response.data;
  },

  markAsRead: async (notificationId) => {
    await authService.checkTokenExpiration();
    const response = await api.post(`/notifications/${notificationId}/mark-read/`);
    return response.data;
  },
};

export const registrarService = {
  // Get registrar profile information
  getProfile: async () => {
    await authService.checkTokenExpiration();
    const response = await api.get('/registrar/profile/');
    return response.data;
  },
  
  // Get all academic issues
  getAllIssues: async () => {
    await authService.checkTokenExpiration();
    
    // Get issues
    const issuesResponse = await api.get('registrar/issues/');
    
    // Get statistics separately
    const statsResponse = await api.get('Registrar_issue_counts/');
    
    return { 
      issues: issuesResponse.data,
      stats: statsResponse.data  // This should include totalIssues, pendingIssues, resolvedIssues
    };
  },
  
  // Assign an issue to a specific lecturer
  assignIssue: async (issueId, lecturerId) => {
    await authService.checkTokenExpiration();
    const response = await api.post(`/assign-issue/${issueId}/`, { 
      lecturer_id: lecturerId 
    });
    return response.data;
  },

  // Get dashboard data
  getDashboardData: async () => {
    await authService.checkTokenExpiration();
    
    // Get profile
    const profileResponse = await api.get('/registrar/profile/');
    
    // Get issue stats (same as in issue counts)
    const statsResponse = await api.get('Registrar_issue_counts/');
    
    return {
      profile: profileResponse.data,
      dashboard: statsResponse.data
    };
  },
  
  // Get issue counts for dashboard
  getIssueStats: async () => {
    await authService.checkTokenExpiration();
    const response = await api.get('Registrar_issue_counts/');
    return response.data;
  },
  
  // Get specific issue details
  getIssueDetails: async (issueId) => {
    await authService.checkTokenExpiration();
    const response = await api.get(`/issue/${issueId}/`);
    return response.data;
  },
  
  // Get resolved issues
  getResolvedIssues: async () => {
    await authService.checkTokenExpiration();
    const response = await api.get('/resolved-issues/');
    return response.data;
  }
};


export const lecturerService = {
  
  getAssignedIssues: async () => {
    const response = await axios.get('/api/assigned-issues/', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access')}`,
      },
    });
    return response.data;
  },
  getResolvedIssues: async () => {
    const response = await axios.get('/api/resolved-issues/', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access')}`,
      },
    });
    return response.data;
  },

  getIssueDetails: async (issueId) => {
    const response = await axios.get(`/api/issues/${issueId}/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access')}`,
      },
    });
    return response.data;
  },

  resolveIssue: async (issueId) => {
    const response = await axios.patch(`/api/issues/${issueId}/resolve/`, {}, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access')}`,
      },
    });
    return response.data;
  },

  getNotifications: async () => {
    const response = await axios.get('/api/lecturer/notifications/', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access')}`,
      },
    });
    return response.data;
  },

  markNotificationAsRead: async (notificationId) => {
    const response = await axios.patch(`/api/lecturer/notifications/${notificationId}/read/`, {}, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access')}`,
      },
    });
    return response.data;
  }
};


export default api;