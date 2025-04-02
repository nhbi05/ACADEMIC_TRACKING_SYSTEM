import React, { createContext, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, logoutUser, initAuth } from '../redux/actions/authActions';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, isLoading, error, tokens } = useSelector(state => state.auth);
  
  // Initialize auth on app startup
  useEffect(() => {
    const initialize = async () => {
      await dispatch(initAuth());
    };
    
    initialize();
  }, [dispatch]);
  
  // Context login will dispatch Redux action
  const login = async (credentials, loginType = 'student') => {
    try {
      const result = await dispatch(loginUser(credentials, loginType));
      return result;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };
  
  // Context logout will dispatch Redux action
  const logout = async () => {
    try {
      const result = await dispatch(logoutUser());
      return result;
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };
  
  // Value object with everything needed from auth state
  const authValue = {
    user,
    isAuthenticated,
    isLoading,
    error,
    tokens,
    login,
    logout
  };
  
  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);