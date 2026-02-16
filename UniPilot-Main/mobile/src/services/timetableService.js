import api from './api';

export const timetableService = {
  // Fetch weekly timetable
  fetchMyTimetable: async () => {
    try {
      const response = await api.get('/timetable/my/view');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Fetch holidays
  fetchHolidays: async target => {
    try {
      const response = await api.get(`/holidays?target=${target}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Fetch settings (e.g., Saturday working)
  fetchSettings: async keys => {
    try {
      const response = await api.get(`/settings?keys=${keys}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default timetableService;
