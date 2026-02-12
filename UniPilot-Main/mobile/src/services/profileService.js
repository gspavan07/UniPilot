import api from './api';

export const profileService = {
  /**
   * Change user password
   * @param {Object} data - Password data
   * @param {string} data.oldPassword - Current password
   * @param {string} data.newPassword - New password
   * @returns {Promise<Object>} Response data
   */
  changePassword: async data => {
    try {
      const response = await api.put('/user/change-password', data);
      return response.data;
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  },

  /**
   * Get student documents (if needed to fetch separately)
   * @returns {Promise<Object>} Documents data
   */
  getDocuments: async () => {
    try {
      const response = await api.get('/user/profile');
      return response.data?.documents || [];
    } catch (error) {
      console.error('Get documents error:', error);
      throw error;
    }
  },
};

export default profileService;
