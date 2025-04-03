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
        const response = await tokenApi.post('/refresh/', { 
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
      authService.setAuthTokens(response.data);
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
  
  // Helper method to store auth tokens
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

// Student services
// Update to studentService in src/services/api.js
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
    try {
      const response = await api.get('/registrar/profile/');
      return {
        ...response.data,
        role: 'registrar' // Ensure role is set
      };
    } catch (error) {
      console.error('Failed to fetch registrar profile:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to fetch registrar profile'
      );
    }
  },
  
  // Get all academic issues with statistics
  getAllIssues: async (params = {}) => {
    await authService.checkTokenExpiration();
    
    try {
      // Get issues with optional query params
      const issuesResponse = await api.get('/registrar/issues/', { params });
      
      // Get statistics (could be combined with issues endpoint)
      const statsResponse = await api.get('/registrar/issues/stats/');
      
      return {
        issues: Array.isArray(issuesResponse.data) 
          ? issuesResponse.data 
          : issuesResponse.data?.issues || [],
        stats: {
          totalIssues: statsResponse.data?.total || issuesResponse.data?.length || 0,
          pendingIssues: statsResponse.data?.pending || 
            issuesResponse.data?.filter(i => i.status !== 'resolved').length || 0,
          resolvedIssues: statsResponse.data?.resolved || 
            issuesResponse.data?.filter(i => i.status === 'resolved').length || 0,
          assignedIssues: statsResponse.data?.assigned || 
            issuesResponse.data?.filter(i => i.assigned_to && i.status !== 'resolved').length || 0
        }
      };
    } catch (error) {
      console.error('Failed to fetch issues:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to fetch issues'
      );
    }
  },
  
  // Assign an issue to a lecturer
  assignIssue: async (issueId, lecturerId) => {
    await authService.checkTokenExpiration();
    
    try {
      const response = await api.patch(`/registrar/issues/${issueId}/assign/`, {
        lecturer_id: lecturerId,
        status: 'assigned' // Ensure status is set
      });
      
      return {
        ...response.data,
        id: issueId, // Ensure ID is included
        assigned_to: lecturerId,
        status: response.data.status || 'assigned'
      };
    } catch (error) {
      console.error('Failed to assign issue:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to assign issue'
      );
    }
  },

  // Get comprehensive dashboard data
  getDashboardData: async () => {
    await authService.checkTokenExpiration();
    
    try {
      const [profileResponse, issuesResponse, statsResponse] = await Promise.all([
        api.get('/registrar/profile/'),
        api.get('/registrar/issues/?limit=5'), // Get recent 5 issues
        api.get('/registrar/issues/stats/')
      ]);
      
      return {
        profile: {
          ...profileResponse.data,
          role: 'registrar'
        },
        dashboard: {
          recentIssues: Array.isArray(issuesResponse.data) 
            ? issuesResponse.data 
            : issuesResponse.data?.issues || [],
          stats: {
            total: statsResponse.data?.total || 0,
            pending: statsResponse.data?.pending || 0,
            resolved: statsResponse.data?.resolved || 0,
            assigned: statsResponse.data?.assigned || 0
          }
        }
      };
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to fetch dashboard data'
      );
    }
  },
  
  // Filter issues with statistics
  filterIssues: async (filters) => {
    await authService.checkTokenExpiration();
    
    try {
      const response = await api.get('/registrar/issues/filter/', { 
        params: filters 
      });
      
      return {
        issues: Array.isArray(response.data) 
          ? response.data 
          : response.data?.issues || [],
        stats: response.data?.stats || {
          total: response.data?.length || 0,
          pending: response.data?.filter(i => i.status !== 'resolved').length || 0,
          resolved: response.data?.filter(i => i.status === 'resolved').length || 0
        }
      };
    } catch (error) {
      console.error('Failed to filter issues:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to filter issues'
      );
    }
  },
  
  // Get detailed issue information
  getIssueDetails: async (issueId) => {
    await authService.checkTokenExpiration();
    
    try {
      const response = await api.get(`/registrar/issues/${issueId}/`);
      return {
        ...response.data,
        id: issueId // Ensure ID is included
      };
    } catch (error) {
      console.error('Failed to fetch issue details:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to fetch issue details'
      );
    }
  },
  
  // Update issue status
  updateIssueStatus: async (issueId, status) => {
    await authService.checkTokenExpiration();
    
    try {
      const response = await api.patch(`/registrar/issues/${issueId}/status/`, {
        status
      });
      
      return {
        ...response.data,
        id: issueId,
        status: response.data.status || status
      };
    } catch (error) {
      console.error('Failed to update issue status:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to update issue status'
      );
    }
  },
  
  // Generate reports
  generateReport: async (params) => {
    await authService.checkTokenExpiration();
    
    try {
      const response = await api.get('/registrar/reports/generate/', {
        params,
        responseType: 'blob' // For file downloads
      });
      
      return {
        data: response.data,
        filename: response.headers['content-disposition']
          ?.split('filename=')[1] 
          || `report-${new Date().toISOString()}.pdf`
      };
    } catch (error) {
      console.error('Failed to generate report:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to generate report'
      );
    }
  }
};
export default api;