import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * ProtectedRoute Component
 * Redirects to login if user is not authenticated
 */
const ProtectedRoute = ({ children }) => {
  const { accessToken } = useSelector((state) => state.auth);

  if (!accessToken) {
    return <Navigate to="/auth/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
