const Book = require('../models/Book');
const BorrowRecord = require('../models/BorrowRecord');
const User = require('../models/User');

// @desc    Get all books
// @route   GET /api/v1/library/books
// @access  Private
exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.status(200).json({ success: true, count: books.length, data: books });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Add new book
// @route   POST /api/v1/library/books
// @access  Private/Admin
exports.addBook = async (req, res) => {
  try {
    const book = await Book.create(req.body);
    res.status(201).json({ success: true, data: book });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Issue book
// @route   POST /api/v1/library/issue
// @access  Private/Admin
exports.issueBook = async (req, res) => {
  const { rollNumber, bookId, dueDate } = req.body;

  try {
    // 1. Find Student
    const student = await User.findOne({ rollNumber });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found with this Roll No' });
    }

    // 2. Find Book
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    // 3. Check Availability
    if (book.available < 1) {
      return res.status(400).json({ success: false, message: 'Book is not available' });
    }

    // 4. Create Borrow Record
    const borrowRecord = await BorrowRecord.create({
      book: bookId,
      user: student._id,
      dueDate,
    });

    // 5. Update Book Availability
    book.available -= 1;
    await book.save();

    res.status(201).json({ success: true, data: borrowRecord });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Return book
// @route   POST /api/v1/library/return
// @access  Private/Admin
exports.returnBook = async (req, res) => {
  const { borrowRecordId } = req.body;

  try {
    const record = await BorrowRecord.findById(borrowRecordId);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Borrow record not found' });
    }

    if (record.status === 'Returned') {
      return res.status(400).json({ success: false, message: 'Book already returned' });
    }

    // Update Record
    record.returnDate = Date.now();
    record.status = 'Returned';
    await record.save();

    // Update Book Availability
    const book = await Book.findById(record.book);
    if (book) {
      book.available += 1;
      await book.save();
    }

    res.status(200).json({ success: true, data: record });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get my borrowed books
// @route   GET /api/v1/library/my
// @access  Private (Student)
exports.getMyBorrowedBooks = async (req, res) => {
  try {
    const records = await BorrowRecord.find({ user: req.user.id })
      .populate('book', 'title author isbn')
      .sort({ dueDate: 1 }); // Sort by due date ascending (soonest due first)

    res.status(200).json({ success: true, count: records.length, data: records });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
