const { Book, BookIssue, User, sequelize } = require("../models");
const logger = require("../utils/logger");
const { Op } = require("sequelize");

// @desc    Add a new book
// @route   POST /api/library/books
// @access  Private/Librarian
exports.addBook = async (req, res) => {
  try {
    const book = await Book.create(req.body);
    res.status(201).json({ success: true, data: book });
  } catch (error) {
    logger.error("Error adding book:", error);
    res.status(500).json({ error: "Failed to add book" });
  }
};

// @desc    Get all books
// @route   GET /api/library/books
// @access  Private/Student/Librarian
exports.getBooks = async (req, res) => {
  try {
    const { search } = req.query;
    const whereClause = {};

    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { author: { [Op.iLike]: `%${search}%` } },
        { isbn: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const books = await Book.findAll({ where: whereClause });
    res.status(200).json({ success: true, data: books });
  } catch (error) {
    logger.error("Error fetching books:", error);
    res.status(500).json({ error: "Failed to fetch books" });
  }
};

// @desc    Issue a book
// @route   POST /api/library/issue
// @access  Private/Librarian
exports.issueBook = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { book_id, student_id, days = 14 } = req.body;

    // 1. Check availability
    const book = await Book.findByPk(book_id, { transaction: t });
    if (!book || book.available_copies < 1) {
      await t.rollback();
      return res.status(400).json({ error: "Book not available" });
    }

    // 2. Issue Book
    const due_date = new Date();
    due_date.setDate(due_date.getDate() + parseInt(days));

    const issue = await BookIssue.create(
      {
        book_id,
        student_id,
        due_date,
        issued_by: req.user.userId,
      },
      { transaction: t }
    );

    // 3. Decrement copies
    await book.decrement("available_copies", { transaction: t });

    // Update status if 0
    if (book.available_copies - 1 === 0) {
      await book.update({ status: "out_of_stock" }, { transaction: t });
    }

    await t.commit();
    res.status(201).json({ success: true, data: issue });
  } catch (error) {
    await t.rollback();
    logger.error("Error issuing book:", error);
    res.status(500).json({ error: "Failed to issue book" });
  }
};

// @desc    Return a book
// @route   POST /api/library/return
// @access  Private/Librarian
exports.returnBook = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { issue_id } = req.body;
    const issue = await BookIssue.findByPk(issue_id, { transaction: t });

    if (!issue || issue.status === "returned") {
      await t.rollback();
      return res.status(400).json({ error: "Invalid issue record" });
    }

    // 1. Calculate Fine
    const return_date = new Date();
    let fine_amount = 0;
    const due_date = new Date(issue.due_date);

    if (return_date > due_date) {
      const diffTime = Math.abs(return_date - due_date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      fine_amount = diffDays * 10; // 10 currency units per day
    }

    // 2. Update Issue
    await issue.update(
      {
        return_date,
        status: "returned",
        fine_amount,
      },
      { transaction: t }
    );

    // 3. Increment Copies
    await Book.increment("available_copies", {
      where: { id: issue.book_id },
      transaction: t,
    });
    await Book.update(
      { status: "available" },
      { where: { id: issue.book_id }, transaction: t }
    );

    await t.commit();
    res.status(200).json({ success: true, data: { issue, fine_amount } });
  } catch (error) {
    await t.rollback();
    logger.error("Error returning book:", error);
    res.status(500).json({ error: "Failed to return book" });
  }
};

// @desc    Get my books
// @route   GET /api/library/my-books
// @access  Private/Student
exports.getMyBooks = async (req, res) => {
  try {
    const issues = await BookIssue.findAll({
      where: { student_id: req.user.userId },
      include: [{ model: Book, as: "book" }],
      order: [["issue_date", "DESC"]],
    });
    res.status(200).json({ success: true, data: issues });
  } catch (error) {
    logger.error("Error fetching my books:", error);
    res.status(500).json({ error: "Failed to fetch my books" });
  }
};
