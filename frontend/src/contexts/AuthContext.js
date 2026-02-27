import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/auth';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          console.log('Found existing token, validating...');
          const userData = await authAPI.getCurrentUser();
          console.log('Token validation successful:', userData);
          setUser(userData);
        } catch (error) {
          console.log('Token validation failed:', error.response?.status);
          
          // Only show error if it's not a simple token expiration
          if (error.response?.status !== 401) {
            console.error('Unexpected auth error:', error);
          }
          
          // Clear invalid token silently
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      } else {
        console.log('No token found, user needs to login');
      }
      
      setLoading(false);
      setInitialized(true);
    };

    // Listen for session expiration events
    const handleSessionExpiredEvent = () => {
      console.log('Session expired event received');
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    };

    window.addEventListener('sessionExpired', handleSessionExpiredEvent);

    initAuth();

    // Cleanup
    return () => {
      window.removeEventListener('sessionExpired', handleSessionExpiredEvent);
    };
  }, []);

  const login = async (credentials, isAutoLogin = false) => {
    try {
      console.log('Attempting login with:', credentials.username);
      const response = await authAPI.login(credentials);
      console.log('Login API call successful, getting user data...');
      
      const userData = await authAPI.getCurrentUser();
      console.log('User data received:', userData);
      setUser(userData);
      
      // Store user data for persistence
      localStorage.setItem('user', JSON.stringify(userData));
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      
      let errorMessage = 'Login failed';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.status === 401) {
        errorMessage = 'Invalid username or password';
      } else if (error.response?.status === 422) {
        errorMessage = 'Please check your login credentials';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    }
  };

  const register = async (userData) => {
    try {
      console.log('Attempting registration with:', userData.username, userData.email);
      await authAPI.register(userData);
      console.log('Registration successful, attempting auto-login...');
      
      // Automatically log in after successful registration
      const loginResult = await login({ username: userData.username, password: userData.password });
      return loginResult;
    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = 'Registration failed';
      
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.status === 400) {
        errorMessage = 'Username or email already exists. Please try different credentials.';
      } else if (error.response?.status === 422) {
        errorMessage = 'Invalid input data. Please check your information.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    }
  };

  const logout = () => {
    console.log('Logging out user');
    authAPI.logout();
    setUser(null);
    // Don't show logout message as toast, it's expected behavior
  };

  // Handle session expiration
  const handleSessionExpired = () => {
    console.log('Session expired, logging out');
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Only show session expired message if user was actually logged in
    if (user && initialized) {
      toast.error('Your session has expired. Please log in again.');
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    initialized,
    isAuthenticated: !!user,
    handleSessionExpired,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};