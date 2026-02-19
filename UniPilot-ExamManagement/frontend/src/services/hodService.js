import api from "../utils/api.js";

// HOD Exam Services

/**
 * Get formatted papers for HOD
 */
export const getHodFormattedPapers = async () => {
    return await api.get("/exam/hod/papers");
};

/**
 * Update paper format (Save Draft)
 */
export const updateHodPaperFormat = async (timetableId, data) => {
    return await api.put(`/exam/hod/paper/${timetableId}`, data);
};

/**
 * Freeze paper format
 */
export const freezeHodPaperFormat = async (timetableId) => {
    return await api.put(`/exam/hod/freeze/${timetableId}`);
};
