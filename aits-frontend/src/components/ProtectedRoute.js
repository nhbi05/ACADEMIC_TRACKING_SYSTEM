import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ element }) => {
  const { user } = useAuth();  // Get user from context

  if (!user) {
    return <Navigate to="/login" />;
  }

  return element;
};

export default ProtectedRoute;
