const Result = require('../models/Result');
const Course = require('../models/Course');

// @desc    Add or Update Result for a student
// @route   POST /api/v1/results
// @access  Private (Faculty)
exports.addResult = async (req, res, next) => {
  try {
    const { studentId, courseId, marksObtained, totalMarks, grade, semester } = req.body;

    // Check if result already exists
    let result = await Result.findOne({ student: studentId, course: courseId });

    if (result) {
      // Update existing
      result.marksObtained = marksObtained;
      result.totalMarks = totalMarks;
      result.grade = grade;
      result.semester = semester;
      await result.save();
    } else {
      // Create new
      result = await Result.create({
        student: studentId,
        course: courseId,
        marksObtained,
        totalMarks,
        grade,
        semester,
      });
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get logged-in student's results
// @route   GET /api/v1/results/my
// @access  Private (Student)
exports.getMyResults = async (req, res, next) => {
  try {
    const results = await Result.find({ student: req.user.id })
      .populate('course', 'name code credits')
      .sort({ createdAt: -1 });

    // Calculate GPA (Simple calculation for demo)
    let totalPoints = 0;
    let totalCredits = 0;

    results.forEach(r => {
      let points = 0;
      if (r.grade === 'A') points = 4.0;
      else if (r.grade === 'B') points = 3.0;
      else if (r.grade === 'C') points = 2.0;
      else if (r.grade === 'D') points = 1.0;
      else points = 0.0;

      // Assuming course has credits, default to 3 if not populated or missing
      const credits = r.course.credits || 3; 
      totalPoints += points * credits;
      totalCredits += credits;
    });

    const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0.0;

    res.status(200).json({
      success: true,
      count: results.length,
      gpa: gpa,
      data: results,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get results for a specific course (Faculty View)
// @route   GET /api/v1/results/course/:courseId
// @access  Private (Faculty)
exports.getCourseResults = async (req, res, next) => {
  try {
    const results = await Result.find({ course: req.params.courseId })
      .populate('student', 'name rollNumber email');

    res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (err) {
    next(err);
  }
};
