import api from './api';

export const authService = {
  // Login
  login: async credentials => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Logout
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Even if API call fails, we still want to clear local data
      console.error('Logout error:', error);
    }
  },

  // Refresh token
  refreshToken: async refreshToken => {
    try {
      const response = await api.post('/auth/refresh', { refreshToken });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Verify token
  verifyToken: async () => {
    try {
      const response = await api.get('/auth/verify');
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default authService;
