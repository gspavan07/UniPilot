import api from './api';

export const dashboardService = {
  // Get dashboard data by aggregating existing granular endpoints
  getDashboard: async semester => {
    try {
      // Use standard authenticated endpoints
      const [attendanceRes, timetableRes] = await Promise.all([
        api.get(`/attendance/my-attendance?semester=${semester}`),
        api.get('/timetable/my/view'),
      ]);

      return {
        attendance: attendanceRes.data.summary,
        timetable: timetableRes.data,
      };
    } catch (error) {
      throw error;
    }
  },

  // Get attendance summary
  getAttendanceSummary: async studentId => {
    try {
      const response = await api.get(
        `/students/${studentId}/attendance/summary`,
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get today's schedule
  getTodaySchedule: async studentId => {
    try {
      const response = await api.get(`/students/${studentId}/schedule/today`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get announcements
  getAnnouncements: async (limit = 5) => {
    try {
      const response = await api.get(`/announcements?limit=${limit}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default dashboardService;
