const Course = require('../models/Course');
const CourseAllocation = require('../models/CourseAllocation');

// @desc    Get all courses
// @route   GET /api/v1/courses
// @access  Public
exports.getCourses = async (req, res, next) => {
  try {
    const courses = await Course.find();
    res.status(200).json({ success: true, count: courses.length, data: courses });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new course
// @route   POST /api/v1/courses
// @access  Private (Admin/Faculty)
exports.createCourse = async (req, res, next) => {
  try {
    const { code, title, department, program, semester } = req.body;

    // Step 1: Code Check (if provided)
    // Code must be unique within the Department & Program (regardless of semester)
    if (code) {
      const existingCode = await Course.findOne({ code, department, program });
      if (existingCode) {
        return res.status(400).json({ success: false, error: 'Course Code already exists in this Department/Program.' });
      }
    }

    // Step 2: Title Check (Fallback/Always)
    // Title must be unique within the specific Semester (to prevent duplicates like "Zero Math" in same sem)
    const existingTitle = await Course.findOne({ title, department, program, semester });
    if (existingTitle) {
      return res.status(400).json({ success: false, error: 'Course with this Title already exists in this Semester.' });
    }

    // Sanitize payload: Ensure empty code is undefined so sparse index works
    const payload = { ...req.body };
    if (!payload.code) delete payload.code;

    const course = await Course.create(payload);
    res.status(201).json({ success: true, data: course });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, error: 'This Course already exists.' });
    }
    next(err);
  }
};

// @desc    Update course
// @route   PUT /api/v1/courses/:id
// @access  Private (Admin)
exports.updateCourse = async (req, res, next) => {
  try {
    let course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: course });
  } catch (err) {
    next(err);
  }
};

// @desc    Assign Teacher to Course (Create Allocation)
// @route   POST /api/v1/courses/allocations
// @access  Private (Admin)
exports.assignTeacher = async (req, res, next) => {
  try {
    const { courseId, teacherId, section, semester, program, batch } = req.body;

    if (!courseId || !teacherId || !section || !semester || !program || !batch) {
      return res.status(400).json({ success: false, error: 'Please provide all required fields' });
    }

    // Upsert allocation
    const allocation = await CourseAllocation.findOneAndUpdate(
      { course: courseId, section, batch, program },
      { teacher: teacherId, semester }, // Update teacher if exists
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: allocation });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Allocations
// @route   GET /api/v1/courses/allocations
// @access  Private (Admin)
exports.getAllocations = async (req, res, next) => {
  try {
    const { program, batch, semester, section } = req.query;
    
    const query = {};
    if (program) query.program = program;
    if (batch) query.batch = batch;
    if (semester) query.semester = semester;
    if (section) query.section = section;

    const allocations = await CourseAllocation.find(query)
      .populate('course', 'title code')
      .populate('teacher', 'name email');

    res.status(200).json({ success: true, count: allocations.length, data: allocations });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete course
// @route   DELETE /api/v1/courses/:id
// @access  Private (Admin)
exports.deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    await course.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};
// @desc    Get courses for logged-in student
// @route   GET /api/v1/courses/my-courses
// @access  Private (Student)
exports.getStudentCourses = async (req, res, next) => {
  try {
    // 1. Get Student Profile
    const StudentProfile = require('../models/StudentProfile'); // Lazy load
    const student = await StudentProfile.findOne({ user: req.user.id });

    if (!student) {
      return res.status(404).json({ success: false, error: 'Student profile not found' });
    }

    // 2. Fetch Allocations matching Program, Semester, and Section
    // This automatically shows courses assigned to their section
    const allocations = await CourseAllocation.find({
      program: student.program,
      semester: student.currentSemester,
      section: student.section,
      batch: student.batch
    })
    .populate('course', 'title code credits')
    .populate('teacher', 'name email');

    res.status(200).json({ success: true, count: allocations.length, data: allocations });
  } catch (err) {
    next(err);
  }
};
