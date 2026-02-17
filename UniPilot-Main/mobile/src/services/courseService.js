import api from './api';

export const courseService = {
  // Get all courses for the logged-in student
  getMyCourses: async () => {
    try {
      const response = await api.get('/courses/my-courses');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get competency outcomes for a specific course
  getCourseOutcomes: async courseId => {
    try {
      const response = await api.get(`/course-outcomes?course_id=${courseId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get CO-PO Matrix for a specific course and program
  getCOPOMatrix: async (courseId, programId) => {
    try {
      const response = await api.get(
        `/co-po-maps/matrix?course_id=${courseId}&program_id=${programId}`,
      );
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default courseService;
