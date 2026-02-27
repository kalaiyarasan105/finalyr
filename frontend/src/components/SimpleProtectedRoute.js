import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Chat.css';

const SimpleProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, initialized } = useAuth();

  // Show loading while authentication is being initialized
  if (loading || !initialized) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Only redirect to login if authentication has been fully initialized
  // and user is definitely not authenticated
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default SimpleProtectedRoute;