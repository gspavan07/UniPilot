import api from './api';

export const attendanceService = {
  // Get student attendance
  getMyAttendance: async (params = {}) => {
    try {
      const { course_id, start_date, end_date, semester } = params;
      let url = '/attendance/my-attendance';

      const queryParams = new URLSearchParams();
      if (course_id) queryParams.append('course_id', course_id);
      if (start_date) queryParams.append('start_date', start_date);
      if (end_date) queryParams.append('end_date', end_date);
      if (semester) queryParams.append('semester', semester);

      const queryString = queryParams.toString();
      if (queryString) url += `?${queryString}`;

      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Apply for leave (placeholder for future use)
  applyLeave: async leaveData => {
    try {
      const response = await api.post('/attendance/leave/apply', leaveData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default attendanceService;
