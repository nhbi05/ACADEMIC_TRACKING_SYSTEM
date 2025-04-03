// src/context/AuthContext.js
import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(prev => {
    // This is a quick fix probably use sessions
    try {
      return JSON.parse(localStorage.getItem('user'))
    } catch {}
    return null
  });
  const [token, setToken] = useState(prev => {
    try {
      return JSON.parse(localStorage.getItem('token'))
    } catch {}
    return null
  });

  const login = (user, token) => {
    setUser(user);
    setToken(token);
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('token', JSON.stringify(token));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };
  // console.log(user ? "Reloading..." : "Bootstarped", {user,token})

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
