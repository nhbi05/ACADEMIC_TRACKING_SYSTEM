// src/redux/reducers/authReducer.js

const initialState = {
    user: null,
    tokens: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    successMessage: null
  };
  
  const authReducer = (state = initialState, action) => {
    switch (action.type) {
      case 'AUTH_REQUEST':
        return {
          ...state,
          isLoading: true,
          error: null,
          successMessage: null
        };
      
      case 'LOGIN_SUCCESS':
        return {
          ...state,
          isLoading: false,
          isAuthenticated: true,
          user: action.payload.user,
          tokens: action.payload.tokens,
          successMessage: 'Login successful! Redirecting...',
          error: null
        };
      
      case 'REGISTER_SUCCESS':
        return {
          ...state,
          isLoading: false,
          successMessage: 'Registration successful! Please login.',
          error: null
        };
      
      case 'AUTH_FAILURE':
        return {
          ...state,
          isLoading: false,
          error: action.payload,
          successMessage: null
        };
      
      case 'LOGOUT':
        return {
          ...initialState
        };
      
      case 'CLEAR_MESSAGES':
        return {
          ...state,
          error: null,
          successMessage: null
        };
      
      default:
        return state;
    }
  };
  
  export default authReducer;