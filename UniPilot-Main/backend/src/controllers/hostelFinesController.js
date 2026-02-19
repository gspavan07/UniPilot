import { sequelize } from "../config/database.js";
import HostelFine from "../models/HostelFine.js";
import User from "../models/User.js";
import HostelAllocation from "../models/HostelAllocation.js";
import FeeStructure from "../models/FeeStructure.js";
import FeeCategory from "../models/FeeCategory.js";
import StudentFeeCharge from "../models/StudentFeeCharge.js";

// @desc    Issue a fine to a hostel student
// @route   POST /api/hostel/fines
// @access  hostel:manage
export const issueFine = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { student_id, allocation_id, fine_type, amount, reason, due_date } =
      req.body;

    // Validate student exists
    const student = await User.findByPk(student_id);
    if (!student) {
      await transaction.rollback();
      return res.status(404).json({ error: "Student not found" });
    }

    // Get current semester from student's profile
    const semester = student.current_semester || 1;

    // Get or create "Hostel Fine" fee category
    let fineCategory = await FeeCategory.findOne({
      where: { name: "Hostel Fine" },
    });

    if (!fineCategory) {
      fineCategory = await FeeCategory.create(
        {
          name: "Hostel Fine",
          description: "Fines issued for hostel violations",
          category_type: "one_time",
          is_active: true,
        },
        { transaction },
      );
    }

    // Create individual fee charge for this fine
    const feeCharge = await StudentFeeCharge.create(
      {
        student_id: student_id,
        category_id: fineCategory.id,
        charge_type: "fine",
        amount: amount,
        description: `${fine_type.replace(/_/g, " ").toUpperCase()} Fine: ${reason}`,
        reference_id: null, // Will update after fine creation
        reference_type: "hostel_fine",
        semester: semester,
        is_paid: false,
        created_by: req.user.userId || req.user.id,
      },
      { transaction },
    );

    // Create fine record
    const fine = await HostelFine.create(
      {
        student_id,
        allocation_id: allocation_id || null,
        fine_type,
        amount,
        reason,
        issued_date: new Date(),
        due_date,
        status: "pending",
        issued_by: req.user.userId || req.user.id,
        fee_charge_id: feeCharge.id,
      },
      { transaction },
    );

    // Update fee charge with reference_id
    await feeCharge.update({ reference_id: fine.id }, { transaction });

    await transaction.commit();

    // Fetch with associations
    const fineWithDetails = await HostelFine.findByPk(fine.id, {
      include: [
        {
          model: User,
          as: "student",
          attributes: ["id", "first_name", "last_name", "email", "student_id"],
        },
        {
          model: User,
          as: "issued_by_user",
          attributes: ["id", "first_name", "last_name"],
        },
      ],
    });

    res.status(201).json({
      message: "Fine issued successfully and added to student's ledger",
      fine: fineWithDetails,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error issuing fine:", error);
    res.status(500).json({ error: "Failed to issue fine" });
  }
};

// @desc    Get all fines with filters
// @route   GET /api/hostel/fines
// @access  hostel:manage
export const getAllFines = async (req, res) => {
  try {
    const { student_id, status, fine_type, page = 1, limit = 50 } = req.query;

    const where = {};
    if (student_id) where.student_id = student_id;
    if (status) where.status = status;
    if (fine_type) where.fine_type = fine_type;

    const offset = (page - 1) * limit;

    const { rows: fines, count } = await HostelFine.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: "student",
          attributes: ["id", "first_name", "last_name", "email", "student_id"],
        },
        {
          model: User,
          as: "issued_by_user",
          attributes: ["id", "first_name", "last_name"],
        },
      ],
      order: [["issued_date", "DESC"]],
      limit: parseInt(limit),
      offset,
    });

    res.json({
      fines,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching fines:", error);
    res.status(500).json({ error: "Failed to fetch fines" });
  }
};

// @desc    Get student's fines
// @route   GET /api/hostel/students/:studentId/fines
// @access  hostel:manage or own student
export const getStudentFines = async (req, res) => {
  try {
    const { studentId } = req.params;

    const fines = await HostelFine.findAll({
      where: { student_id: studentId },
      include: [
        {
          model: User,
          as: "issued_by_user",
          attributes: ["id", "first_name", "last_name"],
        },
      ],
      order: [["issued_date", "DESC"]],
    });

    res.json({ fines });
  } catch (error) {
    console.error("Error fetching student fines:", error);
    res.status(500).json({ error: "Failed to fetch student fines" });
  }
};

// @desc    Update fine (waive, modify amount, cancel)
// @route   PUT /api/hostel/fines/:id
// @access  hostel:manage
export const updateFine = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { status, amount } = req.body;

    const fine = await HostelFine.findByPk(id);
    if (!fine) {
      await transaction.rollback();
      return res.status(404).json({ error: "Fine not found" });
    }

    // Update fine
    if (status) fine.status = status;
    if (amount) fine.amount = amount;
    await fine.save({ transaction });

    // If waived or cancelled, update the fee charge
    if ((status === "waived" || status === "cancelled") && fine.fee_charge_id) {
      await StudentFeeCharge.update(
        { is_paid: status === "waived" }, // waived can be considered settled or we just deactivate
        { where: { id: fine.fee_charge_id }, transaction },
      );
    }

    // If amount changed, update fee charge
    if (amount && fine.fee_charge_id) {
      await StudentFeeCharge.update(
        { amount },
        { where: { id: fine.fee_charge_id }, transaction },
      );
    }

    await transaction.commit();

    res.json({ message: "Fine updated successfully", fine });
  } catch (error) {
    await transaction.rollback();
    console.error("Error updating fine:", error);
    res.status(500).json({ error: "Failed to update fine" });
  }
};

// @desc    Delete fine
// @route   DELETE /api/hostel/fines/:id
// @access  hostel:manage
export const deleteFine = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    const fine = await HostelFine.findByPk(id);
    if (!fine) {
      await transaction.rollback();
      return res.status(404).json({ error: "Fine not found" });
    }

    // Delete associated fee charge
    if (fine.fee_charge_id) {
      await StudentFeeCharge.destroy({
        where: { id: fine.fee_charge_id },
        transaction,
      });
    }

    await fine.destroy({ transaction });
    await transaction.commit();

    res.json({ message: "Fine deleted successfully" });
  } catch (error) {
    await transaction.rollback();
    console.error("Error deleting fine:", error);
    res.status(500).json({ error: "Failed to delete fine" });
  }
};

export default {
  issueFine,
  getAllFines,
  getStudentFines,
  updateFine,
  deleteFine,
};
