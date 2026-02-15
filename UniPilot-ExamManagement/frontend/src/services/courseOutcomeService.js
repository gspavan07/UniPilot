import api from "../utils/api";

// Fetch all course outcomes for a specific course
export const getCourseOutcomes = (courseId) =>
    api.get("/course-outcomes", { params: { course_id: courseId } });
