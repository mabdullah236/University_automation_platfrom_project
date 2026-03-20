const Exam = require('../models/Exam');
const Course = require('../models/Course');

// @desc    Schedule a new exam
// @route   POST /api/v1/exams
// @access  Private (Admin)
exports.scheduleExam = async (req, res, next) => {
  try {
    const { course, date, startTime, duration, type, roomNumber } = req.body;

    const exam = await Exam.create({
      course,
      date,
      startTime,
      duration,
      type,
      roomNumber,
    });

    res.status(201).json({
      success: true,
      data: exam,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all exams
// @route   GET /api/v1/exams
// @access  Private (Admin, Faculty, Student)
exports.getExams = async (req, res, next) => {
  try {
    const exams = await Exam.find().populate('course', 'name code').sort({ date: 1 });

    res.status(200).json({
      success: true,
      count: exams.length,
      data: exams,
    });
  } catch (err) {
    next(err);
  }
};
