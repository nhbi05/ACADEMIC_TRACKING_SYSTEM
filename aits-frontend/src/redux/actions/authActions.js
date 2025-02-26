// src/redux/actions/authActions.js
import { authService } from '../../services/api';

// Action Types (can be moved to a separate constants file)
export const AUTH_REQUEST = 'AUTH_REQUEST';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const REGISTER_SUCCESS = 'REGISTER_SUCCESS';
export const AUTH_FAILURE = 'AUTH_FAILURE';
export const LOGOUT = 'LOGOUT';
export const CLEAR_MESSAGES = 'CLEAR_MESSAGES';

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
export const loginUser = (credentials, loginType) => async (dispatch) => {
  dispatch(loginRequest());
  
  try {
    const response = await authService.login({ 
      ...credentials, 
      loginType 
    });
    
    dispatch(loginSuccess(
      response.user, 
      {
        access: response.access,
        refresh: response.refresh
      }
    ));
    
    // Return successful response to handle navigation
    return { success: true, userType: loginType };
  } catch (err) {
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
    
    if (err.response?.data) {
      errorMessage = Object.entries(err.response.data)
        .map(([key, value]) => `${key}: ${value}`)
        .join(' ');
    }
    
    dispatch(authFailure(errorMessage));
    return { success: false };
  }
};