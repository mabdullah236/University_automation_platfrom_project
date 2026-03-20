const express = require('express');
const {
  getAllBooks,
  addBook,
  issueBook,
  returnBook,
  getMyBorrowedBooks,
} = require('../controllers/libraryController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

// Public to all authenticated users
router.get('/books', getAllBooks);
router.get('/my', authorize('student'), getMyBorrowedBooks);

// Admin only routes
router.post('/books', authorize('admin'), addBook);
router.post('/issue', authorize('admin'), issueBook);
router.post('/return', authorize('admin'), returnBook);

module.exports = router;
