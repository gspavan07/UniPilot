import api from './api';

export const marksService = {
  /**
   * Fetch student results for a specific semester
   * @param {Object} params - Query parameters
   * @param {number} params.semester - The semester to fetch results for
   * @returns {Promise<Object>} Results data including mid_term, internal_lab, end_semester and GPA
   */
  getMyResults: async (params = {}) => {
    try {
      const { semester } = params;
      let url = '/exam/my-results';

      const queryParams = new URLSearchParams();
      if (semester) queryParams.append('semester', semester);

      const queryString = queryParams.toString();
      if (queryString) url += `?${queryString}`;

      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching marks:', error);
      throw error;
    }
  },
};

export default marksService;
