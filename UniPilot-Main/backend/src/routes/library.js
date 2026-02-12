const express = require("express");
const {
  addBook,
  getBooks,
  issueBook,
  returnBook,
  getMyBooks,
} = require("../controllers/libraryController");
const { authenticate, checkPermission } = require("../middleware/auth");

const router = express.Router();

router.use(authenticate);

// Public/Student routes (Authenticated)
router.get("/books", checkPermission("library:books:view"), getBooks);
router.get("/my-books", getMyBooks);

// Librarian routes
router.post("/books", checkPermission("library:books:manage"), addBook);
router.post("/issue", checkPermission("library:issue"), issueBook);
router.post("/return", checkPermission("library:issue"), returnBook);

module.exports = router;
