import { Regulation } from "../../academics/models/index.js";


/**
 * Get exam configuration for a specific regulation
 */
export const getExamConfig = async (req, res) => {
  try {
    const { regulationId } = req.params;

    const regulation = await Regulation.findByPk(regulationId);
    if (!regulation) {
      return res.status(404).json({ message: "Regulation not found" });
    }

    res.json({
      exam_configuration: regulation.exam_configuration || { course_types: [] },
    });
  } catch (error) {
    console.error("Error fetching exam configuration:", error);
    res.status(500).json({ message: "Failed to fetch exam configuration" });
  }
};

/**
 * Update exam configuration for a specific regulation
 */
export const updateExamConfig = async (req, res) => {
  try {
    const { regulationId } = req.params;
    const { exam_configuration } = req.body;

    // Validate exam_configuration structure
    if (
      !exam_configuration ||
      !Array.isArray(exam_configuration.course_types)
    ) {
      return res.status(400).json({
        message:
          "Invalid exam configuration structure. Expected { course_types: [] }",
      });
    }

    // Validate each course type
    for (const courseType of exam_configuration.course_types) {
      if (!courseType.id || !courseType.name || !courseType.structure) {
        return res.status(400).json({
          message: "Each course type must have id, name, and structure",
        });
      }

      // Validate structure has required fields
      if (
        !courseType.structure.id ||
        !courseType.structure.name ||
        courseType.structure.max_marks === undefined
      ) {
        return res.status(400).json({
          message: "Course type structure must have id, name, and max_marks",
        });
      }
    }

    const regulation = await Regulation.findByPk(regulationId);
    if (!regulation) {
      return res.status(404).json({ message: "Regulation not found" });
    }

    // Direct assignment and save for JSONB fields
    regulation.exam_configuration = exam_configuration;
    regulation.changed("exam_configuration", true);
    await regulation.save();

    res.json({
      message: "Exam configuration updated successfully",
      exam_configuration: regulation.exam_configuration,
    });
  } catch (error) {
    console.error("Error updating exam configuration:", error);
    res.status(500).json({ message: "Failed to update exam configuration" });
  }
};

/**
 * Add a new course type to exam configuration
 */
export const addCourseType = async (req, res) => {
  try {
    const { regulationId } = req.params;
    const { courseType } = req.body;

    if (
      !courseType ||
      !courseType.id ||
      !courseType.name ||
      !courseType.structure
    ) {
      return res.status(400).json({
        message: "Course type must have id, name, and structure",
      });
    }

    const regulation = await Regulation.findByPk(regulationId);
    if (!regulation) {
      return res.status(404).json({ message: "Regulation not found" });
    }

    const examConfig = regulation.exam_configuration || { course_types: [] };

    // Check if course type already exists
    const exists = examConfig.course_types.some(
      (ct) => ct.id === courseType.id,
    );
    if (exists) {
      return res.status(400).json({
        message: "Course type with this ID already exists",
      });
    }

    // Create new object to ensure Sequelize detects the change
    const newExamConfig = {
      course_types: [...examConfig.course_types, courseType],
    };

    // Direct assignment and save for JSONB fields
    regulation.exam_configuration = newExamConfig;
    regulation.changed("exam_configuration", true);
    await regulation.save();

    res.json({
      message: "Course type added successfully",
      exam_configuration: regulation.exam_configuration,
    });
  } catch (error) {
    console.error("Error adding course type:", error);
    res.status(500).json({ message: "Failed to add course type" });
  }
};

/**
 * Update a specific course type
 */
export const updateCourseType = async (req, res) => {
  try {
    const { regulationId, courseTypeId } = req.params;
    const { courseType } = req.body;

    const regulation = await Regulation.findByPk(regulationId);
    if (!regulation) {
      return res.status(404).json({ message: "Regulation not found" });
    }

    const examConfig = regulation.exam_configuration || { course_types: [] };
    const index = examConfig.course_types.findIndex(
      (ct) => ct.id === courseTypeId,
    );

    if (index === -1) {
      return res.status(404).json({ message: "Course type not found" });
    }

    // Create new array with updated course type
    const newCourseTypes = examConfig.course_types.map((ct, i) =>
      i === index ? { ...ct, ...courseType } : ct,
    );

    const newExamConfig = { course_types: newCourseTypes };

    // Direct assignment and save for JSONB fields
    regulation.exam_configuration = newExamConfig;
    regulation.changed("exam_configuration", true);
    await regulation.save();

    res.json({
      message: "Course type updated successfully",
      exam_configuration: regulation.exam_configuration,
    });
  } catch (error) {
    console.error("Error updating course type:", error);
    res.status(500).json({ message: "Failed to update course type" });
  }
};

/**
 * Delete a course type
 */
export const deleteCourseType = async (req, res) => {
  try {
    const { regulationId, courseTypeId } = req.params;

    const regulation = await Regulation.findByPk(regulationId);
    if (!regulation) {
      return res.status(404).json({ message: "Regulation not found" });
    }

    const examConfig = regulation.exam_configuration || { course_types: [] };

    // Create new object with filtered course types
    const newExamConfig = {
      course_types: examConfig.course_types.filter(
        (ct) => ct.id !== courseTypeId,
      ),
    };

    // Direct assignment and save for JSONB fields
    regulation.exam_configuration = newExamConfig;
    regulation.changed("exam_configuration", true);
    await regulation.save();

    res.json({
      message: "Course type deleted successfully",
      exam_configuration: regulation.exam_configuration,
    });
  } catch (error) {
    console.error("Error deleting course type:", error);
    res.status(500).json({ message: "Failed to delete course type" });
  }
};

export default {
  getExamConfig,
  updateExamConfig,
  addCourseType,
  updateCourseType,
  deleteCourseType,
};
