import api from "../utils/api.js";

// Exam Cycle APIs
export const getAllCycles = (params = {}) =>
  api.get("/exam/cycles", { params });
export const getCycleById = (id) => api.get(`/exam/cycles/${id}`);
export const createCycle = (data) => api.post("/exam/cycles", data);
export const updateCycle = (id, data) => api.put(`/exam/cycles/${id}`, data);
export const deleteCycle = (id) => api.delete(`/exam/cycles/${id}`);

// Helper APIs for form dropdowns
export const getAllRegulations = () =>
  api.get("/exam/cycles/helpers/regulations");
export const getAllDegrees = () => api.get("/exam/cycles/helpers/degrees");
export const getAllBatches = () => api.get("/exam/cycles/helpers/batches");
export const getCourseTypes = (regulationId) =>
  api.get(`/exam/cycles/helpers/course-types/${regulationId}`);
export const getCycleTypes = (regulationId, courseType) =>
  api.get(`/exam/cycles/helpers/cycle-types/${regulationId}/${courseType}`);
export const getCurrentSemester = (batch) =>
  api.get(`/exam/cycles/helpers/semester/${batch}`);
export const getProgramsByDegree = (degree) =>
  api.get(`/exam/cycles/helpers/programs/${degree}`);

// Timetable APIs
export const getTimetablesByCycle = (cycleId, programId = null) => {
  const params = programId ? { programId } : {};
  return api.get(`/exam/cycles/${cycleId}/timetables`, { params });
};
export const addTimetableEntry = (cycleId, data) =>
  api.post(`/exam/cycles/${cycleId}/timetables`, data);
export const autoGenerateTimetable = (cycleId, data) =>
  api.post(`/exam/cycles/${cycleId}/timetables/auto-generate`, data);
export const updateTimetableEntry = (id, data) =>
  api.put(`/exam/cycles/timetables/${id}`, data);
export const deleteTimetableEntry = (id) =>
  api.delete(`/exam/cycles/timetables/${id}`);
export const deleteAllTimetables = (cycleId) =>
  api.delete(`/exam/cycles/${cycleId}/timetables/all`);
export const bulkUpdateTimetables = (cycleId, updates) =>
  api.put(`/exam/cycles/${cycleId}/timetables/bulk-update`, { updates });

export const getFacultyList = () => api.get("/users", { params: { role: "faculty" } });

// Faculty Exam APIs
export const getAssignedExams = () => api.get("/exam/faculty/assigned-exams");
export const updatePaperFormat = (timetableId, data) =>
  api.put(`/exam/faculty/paper-format/${timetableId}`, data);


// Fee Configuration APIs
export const getFeeConfigByCycle = (cycleId) =>
  api.get(`/exam/cycles/${cycleId}/fee-config`);
export const createFeeConfig = (cycleId, data) =>
  api.post(`/exam/cycles/${cycleId}/fee-config`, data);
export const updateFeeConfig = (id, data) =>
  api.put(`/exam/cycles/fee-config/${id}`, data);
export const addLatFeeSlab = (feeConfigId, data) =>
  api.post(`/exam/cycles/fee-config/${feeConfigId}/slabs`, data);
export const updateLatFeeSlab = (id, data) =>
  api.put(`/exam/cycles/late-fee-slabs/${id}`, data);
export const deleteLatFeeSlab = (id) =>
  api.delete(`/exam/cycles/late-fee-slabs/${id}`);
export const getFeeConfigAuditLogs = (feeConfigId) =>
  api.get(`/exam/cycles/fee-config/${feeConfigId}/audit-logs`);
export const calculateFee = (cycleId) =>
  api.post("/exam/cycles/fee-config/calculate", { cycle_id: cycleId });

export const getCycleStudents = (id) => api.get(`/exam/cycles/${id}/students`);
