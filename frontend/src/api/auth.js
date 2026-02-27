import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Making request to:', config.url, 'with method:', config.method);
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Handle responses and errors
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.status, response.statusText);
    return response;
  },
  (error) => {
    console.error('Response error:', error);
    
    // Handle network errors
    if (!error.response) {
      console.error('Network error - server may be down');
      error.message = 'Network Error: Cannot connect to server. Please check if the backend is running on port 8000.';
    } else {
      console.error('HTTP error:', error.response.status, error.response.data);
    }
    
    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401) {
      console.log('Unauthorized - clearing token');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: async (userData) => {
    try {
      console.log('Attempting registration for:', userData.username);
      const response = await api.post('/auth/register', userData);
      console.log('Registration response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Registration API error:', error);
      throw error;
    }
  },

  login: async (credentials) => {
    try {
      console.log('Attempting login for:', credentials.username);
      const response = await api.post('/auth/login', credentials);
      const { access_token } = response.data;
      
      if (!access_token) {
        throw new Error('No access token received');
      }
      
      localStorage.setItem('token', access_token);
      console.log('Login successful, token stored');
      return response.data;
    } catch (error) {
      console.error('Login API error:', error);
      throw error;
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      console.log('User data retrieved:', response.data);
      return response.data;
    } catch (error) {
      console.error('Get user API error:', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('User logged out, tokens cleared');
  },

  // Test server connectivity
  testConnection: async () => {
    try {
      console.log('Testing server connection...');
      const response = await api.get('/health');
      console.log('Connection test successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('Connection test failed:', error);
      throw error;
    }
  },

  // Check if token exists and is valid format
  hasValidToken: () => {
    const token = localStorage.getItem('token');
    return token && token.length > 0;
  },
};

export default api;