import { StudentDocument } from "../models/index.js";

export const createStudentDocuments = async ({
  userId,
  files = [],
  documentTypes = [],
} = {}) => {
  if (!userId || !Array.isArray(files) || files.length === 0) return [];

  const types = Array.isArray(documentTypes) ? documentTypes : [documentTypes];

  const payload = files.map((file, index) => ({
    user_id: userId,
    name: file.originalname,
    file_url: `/uploads/student_docs/${file.filename}`,
    type: types[index] || "Other",
    status: "pending",
  }));

  return StudentDocument.bulkCreate(payload);
};

export default {
  createStudentDocuments,
};
