// src/redux/actions/authActions.js
import { authService,studentService } from '../../services/api';
import api from '../../services/api';

// Action Types (can be moved to a separate constants file)
export const AUTH_INITIALIZED = 'AUTH_INITIALIZED';
export const AUTH_REQUEST = 'AUTH_REQUEST';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const REGISTER_SUCCESS = 'REGISTER_SUCCESS';
export const AUTH_FAILURE = 'AUTH_FAILURE';
export const LOGOUT = 'LOGOUT';
export const CLEAR_MESSAGES = 'CLEAR_MESSAGES';

export const authInitialized = (user) => ({
  type: AUTH_INITIALIZED,
  payload: user
});
export const initAuth = () => async (dispatch) => {
  let token
  try {
    token = JSON.parse(localStorage.getItem('token'))
  } catch {
    token = null
  }
  
  if (!token) {
    return false;
  }
  
  try {
    // Set the token in axios defaults
    api.defaults.headers.common['Authorization'] = `Bearer ${token.access}`;
    
    // Get current user info to validate token
    // If you have a /me or /user endpoint, use that instead
    const userData = await studentService.getProfile();
    
    dispatch(authInitialized({ 
      user: userData,
      tokens: { access: token.access, refresh: token.refresh }
    }));
    return true;
  } catch (error) {
    // If token is invalid, try refresh
    try {
      if (token.refresh) {
        const response = await authService.refresh(token.refresh);
        localStorage.setItem('access', response.access);
        api.defaults.headers.common['Authorization'] = `Bearer ${response.access}`;
        
        // Try again with new token
        const userData = await studentService.getProfile();
        dispatch(authInitialized({ 
          user: userData,
          tokens: { access: response.access, refresh: token.refresh }
        }));
        return true;
      }
    } catch (refresh) {
      // Clear invalid tokens
      localStorage.removeItem('token');
      return false;
    }
  }
};
// Action creators
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

// Async action creators (thunks)
// In loginUser action
export const loginUser = (credentials, loginType, auth) => async (dispatch) => {
  dispatch(loginRequest());
  
  try {
    const response = await authService.login({ 
      ...credentials, 
      loginType 
    });
    
    console.log('Auth response:', response);
    
    const user = response.user
    const token = { access: response.access, refresh: response.refresh }
    const { login } = auth

    login(user, token)
    dispatch(loginSuccess(
      response.user, 
      {
        access: response.access,
        refresh: response.refresh
      }
    ));
    
    return { success: true, userType: loginType };
  } catch (err) {
    console.error('Login error:', err);
    const errorMessage = err.response?.data?.message || 'Login failed. Please check your credentials.';
    dispatch(authFailure(errorMessage));
    return { success: false };
  }
};
export const registerUser = (userData) => async (dispatch) => {
  dispatch(loginRequest());
  
  try {
    await authService.register(userData);
    dispatch(registerSuccess());
    return { success: true };
  } catch (err) {
    let errorMessage = 'Registration failed. Please try again.';
    // console.log(err)
    
    if (err.response?.data) {
      errorMessage = Object.entries(err.response.data)
        .map(([key, value]) => `${key}: ${value}`)
        .join(' ');
        
    }
    
    dispatch(authFailure(errorMessage));
    return { success: false };
  }
};

export const logoutUser = () => async (dispatch) => {
  await authService.logout();
  dispatch(logout());
  return { success: true };
};