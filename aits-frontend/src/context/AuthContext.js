// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load authentication state on component mount
  useEffect(() => {
    try {
      // Load user data
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        setUser(userData);
      }
      
      // Load tokens - check both formats for backward compatibility
      const accessToken = localStorage.getItem('access');
      const refreshToken = localStorage.getItem('refresh');
      const tokensStr = localStorage.getItem('tokens');
      
      if (accessToken && refreshToken) {
        // Old format
        setToken({
          access: accessToken,
          refresh: refreshToken
        });
      } else if (tokensStr) {
        // New format
        const tokens = JSON.parse(tokensStr);
        setToken(tokens);
      }
      
      console.log("Auth state loaded:", { 
        userExists: !!userStr, 
        tokensExist: !!(accessToken && refreshToken) || !!tokensStr 
      });
    } catch (error) {
      console.error("Error loading auth state:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (userData, tokenData) => {
    console.log("Login called with:", { userData, tokenData });
    
    // Handle direct API response from your backend
    // Extract what we need based on your API response structure
    const user = userData?.user || userData;
    const tokens = {
      access: tokenData?.access || userData?.access,
      refresh: tokenData?.refresh || userData?.refresh
    };
    
    // Validate we have what we need
    if (!user) {
      console.error("Invalid user data for login");
      return;
    }
    
    if (!tokens.access || !tokens.refresh) {
      console.error("Invalid token data for login");
      return;
    }
    
    // Update state
    setUser(user);
    setToken(tokens);
    
    // Store in localStorage - modern format
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('tokens', JSON.stringify(tokens));
    
    // Also store individually for compatibility with some components
    localStorage.setItem('access', tokens.access);
    localStorage.setItem('refresh', tokens.refresh);
    
    console.log("Auth state updated after login");
  };

  const logout = () => {
    // Clear state
    setUser(null);
    setToken(null);
    
    // Clear all auth-related localStorage items
    localStorage.removeItem('user');
    localStorage.removeItem('tokens');
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
  };

  // Computed property for easy auth checking
  const isAuthenticated = !!token?.access && !!user;
  
  return (
    <AuthContext.Provider value={{ 
      user, 
      token,
      isAuthenticated,
      loading,
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
