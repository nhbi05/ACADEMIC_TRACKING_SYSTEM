// src/redux/actions/authActions.js
import { authService, studentService } from '../../services/api';
import api from '../../services/api';

// Action Types
export const AUTH_INITIALIZED = 'AUTH_INITIALIZED';
export const AUTH_REQUEST = 'AUTH_REQUEST';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const REGISTER_SUCCESS = 'REGISTER_SUCCESS';
export const AUTH_FAILURE = 'AUTH_FAILURE';
export const LOGOUT = 'LOGOUT';
export const CLEAR_MESSAGES = 'CLEAR_MESSAGES';

// Helper Functions for Token Management
const saveTokens = (tokens) => {
  localStorage.setItem('token', JSON.stringify({
    access: tokens.access,
    refresh: tokens.refresh
  }));
};

const getTokens = () => {
  try {
    return JSON.parse(localStorage.getItem('token'));
  } catch (error) {
    return null;
  }
};

const clearTokens = () => {
  localStorage.removeItem('token');
  delete api.defaults.headers.common['Authorization'];
};

const setAuthHeader = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Action Creators
export const authInitialized = (user) => ({
  type: AUTH_INITIALIZED,
  payload: user
});

export const loginRequest = () => ({
  type: AUTH_REQUEST
});

export const loginSuccess = (user, tokens) => ({
  type: LOGIN_SUCCESS,
  payload: { user, tokens }
});

export const registerSuccess = () => ({
  type: REGISTER_SUCCESS
});

export const authFailure = (error) => ({
  type: AUTH_FAILURE,
  payload: error
});

export const logout = () => ({
  type: LOGOUT
});

export const clearMessages = () => ({
  type: CLEAR_MESSAGES
});

// Async Action Creators (Thunks)

// Initialize Authentication - Check if user is already logged in
export const initAuth = () => async (dispatch) => {
  const tokens = getTokens();
  
  if (!tokens || !tokens.access) {
    return false;
  }
  
  try {
    // Set the auth header with existing token
    setAuthHeader(tokens.access);
    
    // Verify token by fetching user profile
    const userData = await studentService.getProfile();
    
    dispatch(authInitialized({ 
      user: userData,
      tokens: tokens
    }));
    return true;
  } catch (error) {
    // Don't logout here - let the API interceptor handle token refresh
    // Just return false to indicate initialization failed
    return false;
  }
};

// Login User
export const loginUser = (credentials, loginType, auth) => async (dispatch) => {
  dispatch(loginRequest());
  
  try {
    const response = await authService.login({ 
      ...credentials, 
      loginType 
    });
    
    // Extract user and tokens
    const user = response.user;
    const tokens = { 
      access: response.access, 
      refresh: response.refresh 
    };
    
    // Save tokens and set auth header
    saveTokens(tokens);
    setAuthHeader(tokens.access);
    
    // If auth object with login function is provided, call it
    if (auth && typeof auth.login === 'function') {
      auth.login(user, tokens);
    }
    
    // Update Redux state
    dispatch(loginSuccess(user, tokens));
    
    return { success: true, userType: loginType };
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Login failed. Please check your credentials.';
    dispatch(authFailure(errorMessage));
    return { success: false };
  }
};

// Register User
export const registerUser = (userData) => async (dispatch) => {
  dispatch(loginRequest());
  
  try {
    await authService.register(userData);
    dispatch(registerSuccess());
    return { success: true };
  } catch (err) {
    let errorMessage = 'Registration failed. Please try again.';
    
    if (err.response?.data) {
      errorMessage = Object.entries(err.response.data)
        .map(([key, value]) => `${key}: ${value}`)
        .join(' ');
    }
    
    dispatch(authFailure(errorMessage));
    return { success: false };
  }
};

// Logout User
export const logoutUser = () => async (dispatch) => {
  try {
    // Attempt to call the logout API endpoint
    await authService.logout();
  } catch (error) {
    // Continue with logout process even if API call fails
  } finally {
    // Clear tokens and auth header
    clearTokens();
    
    // Update Redux state
    dispatch(logout());
    
    return { success: true };
  }
};

// Refresh Token - this will be called by the API interceptor
export const refreshToken = (refreshTokenString) => async (dispatch) => {
  try {
    let tokenToUse = refreshTokenString;
    
    if (!tokenToUse) {
      const currentTokens = getTokens();
      if (!currentTokens || !currentTokens.refresh) {
        return false;
      }
      tokenToUse = currentTokens.refresh;
    }
    
    const response = await authService.refresh(tokenToUse);
    
    const newTokens = {
      access: response.access,
      // Keep existing refresh token if a new one isn't provided
      refresh: response.refresh || tokenToUse
    };
    
    saveTokens(newTokens);
    setAuthHeader(newTokens.access);
    
    return true;
  } catch (error) {
    // If refresh fails, clear tokens but don't logout yet
    // Let the calling code decide whether to logout
    return false;
  }
};