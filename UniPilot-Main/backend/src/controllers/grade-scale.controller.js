import Regulation from "../models/Regulation.js";

/**
 * Get grade scale for a specific regulation
 */
export const getGradeScale = async (req, res) => {
  try {
    const { regulationId } = req.params;

    const regulation = await Regulation.findByPk(regulationId);
    if (!regulation) {
      return res.status(404).json({ message: "Regulation not found" });
    }

    res.json({
      grade_scale: regulation.grade_scale || [],
    });
  } catch (error) {
    console.error("Error fetching grade scale:", error);
    res.status(500).json({ message: "Failed to fetch grade scale" });
  }
};

/**
 * Update entire grade scale for a regulation
 */
export const updateGradeScale = async (req, res) => {
  try {
    const { regulationId } = req.params;
    const { grade_scale } = req.body;

    // Validate grade_scale structure
    if (!Array.isArray(grade_scale)) {
      return res.status(400).json({
        message: "Invalid grade scale structure. Expected an array",
      });
    }

    // Validate each grade
    for (const grade of grade_scale) {
      if (
        !grade.id ||
        !grade.grade ||
        grade.min === undefined ||
        grade.max === undefined ||
        grade.points === undefined
      ) {
        return res.status(400).json({
          message:
            "Each grade must have id, grade, min, max, and points fields",
        });
      }

      if (grade.min >= grade.max) {
        return res.status(400).json({
          message: `Invalid range for grade ${grade.grade}: min must be less than max`,
        });
      }
    }

    // Check for overlapping ranges
    for (let i = 0; i < grade_scale.length; i++) {
      for (let j = i + 1; j < grade_scale.length; j++) {
        const g1 = grade_scale[i];
        const g2 = grade_scale[j];

        if (
          (g1.min <= g2.max && g1.max >= g2.min) ||
          (g2.min <= g1.max && g2.max >= g1.min)
        ) {
          return res.status(400).json({
            message: `Overlapping ranges detected between ${g1.grade} and ${g2.grade}`,
          });
        }
      }
    }

    const regulation = await Regulation.findByPk(regulationId);
    if (!regulation) {
      return res.status(404).json({ message: "Regulation not found" });
    }

    // Direct assignment and save for JSONB fields
    regulation.grade_scale = grade_scale;
    regulation.changed("grade_scale", true);
    await regulation.save();

    res.json({
      message: "Grade scale updated successfully",
      grade_scale: regulation.grade_scale,
    });
  } catch (error) {
    console.error("Error updating grade scale:", error);
    res.status(500).json({ message: "Failed to update grade scale" });
  }
};

/**
 * Add a new grade to the grade scale
 */
export const addGrade = async (req, res) => {
  try {
    const { regulationId } = req.params;
    const { grade } = req.body;

    if (
      !grade ||
      !grade.id ||
      !grade.grade ||
      grade.min === undefined ||
      grade.max === undefined ||
      grade.points === undefined
    ) {
      return res.status(400).json({
        message: "Grade must have id, grade, min, max, and points fields",
      });
    }

    if (grade.min >= grade.max) {
      return res.status(400).json({
        message: "Min must be less than max",
      });
    }

    const regulation = await Regulation.findByPk(regulationId);
    if (!regulation) {
      return res.status(404).json({ message: "Regulation not found" });
    }

    const gradeScale = regulation.grade_scale || [];

    // Check for duplicate grade name
    if (gradeScale.some((g) => g.grade === grade.grade)) {
      return res.status(400).json({
        message: `Grade "${grade.grade}" already exists`,
      });
    }

    // Check for overlapping ranges
    for (const existingGrade of gradeScale) {
      if (
        (grade.min <= existingGrade.max && grade.max >= existingGrade.min) ||
        (existingGrade.min <= grade.max && existingGrade.max >= grade.min)
      ) {
        return res.status(400).json({
          message: `Range overlaps with existing grade "${existingGrade.grade}"`,
        });
      }
    }

    const newGradeScale = [...gradeScale, grade];

    // Direct assignment and save
    regulation.grade_scale = newGradeScale;
    regulation.changed("grade_scale", true);
    await regulation.save();

    res.json({
      message: "Grade added successfully",
      grade_scale: regulation.grade_scale,
    });
  } catch (error) {
    console.error("Error adding grade:", error);
    res.status(500).json({ message: "Failed to add grade" });
  }
};

/**
 * Update a specific grade
 */
export const updateGrade = async (req, res) => {
  try {
    const { regulationId, gradeId } = req.params;
    const { grade } = req.body;

    const regulation = await Regulation.findByPk(regulationId);
    if (!regulation) {
      return res.status(404).json({ message: "Regulation not found" });
    }

    const gradeScale = regulation.grade_scale || [];
    const index = gradeScale.findIndex((g) => g.id === gradeId);

    if (index === -1) {
      return res.status(404).json({ message: "Grade not found" });
    }

    if (grade.min >= grade.max) {
      return res.status(400).json({
        message: "Min must be less than max",
      });
    }

    // Check for overlapping ranges (excluding current grade)
    for (let i = 0; i < gradeScale.length; i++) {
      if (i === index) continue;

      const existingGrade = gradeScale[i];
      if (
        (grade.min <= existingGrade.max && grade.max >= existingGrade.min) ||
        (existingGrade.min <= grade.max && existingGrade.max >= grade.min)
      ) {
        return res.status(400).json({
          message: `Range overlaps with existing grade "${existingGrade.grade}"`,
        });
      }
    }

    const newGradeScale = gradeScale.map((g, i) =>
      i === index ? { ...g, ...grade } : g,
    );

    regulation.grade_scale = newGradeScale;
    regulation.changed("grade_scale", true);
    await regulation.save();

    res.json({
      message: "Grade updated successfully",
      grade_scale: regulation.grade_scale,
    });
  } catch (error) {
    console.error("Error updating grade:", error);
    res.status(500).json({ message: "Failed to update grade" });
  }
};

/**
 * Delete a grade
 */
export const deleteGrade = async (req, res) => {
  try {
    const { regulationId, gradeId } = req.params;

    const regulation = await Regulation.findByPk(regulationId);
    if (!regulation) {
      return res.status(404).json({ message: "Regulation not found" });
    }

    const gradeScale = regulation.grade_scale || [];
    const newGradeScale = gradeScale.filter((g) => g.id !== gradeId);

    if (newGradeScale.length === gradeScale.length) {
      return res.status(404).json({ message: "Grade not found" });
    }

    regulation.grade_scale = newGradeScale;
    regulation.changed("grade_scale", true);
    await regulation.save();

    res.json({
      message: "Grade deleted successfully",
      grade_scale: regulation.grade_scale,
    });
  } catch (error) {
    console.error("Error deleting grade:", error);
    res.status(500).json({ message: "Failed to delete grade" });
  }
};

export default {
  getGradeScale,
  updateGradeScale,
  addGrade,
  updateGrade,
  deleteGrade,
};
