const Timetable = require('../models/Timetable');
const Course = require('../models/Course');

// @desc    Create a timetable slot
// @route   POST /api/v1/timetable
// @access  Private (Admin)
exports.createSchedule = async (req, res, next) => {
  try {
    const { course, day, startTime, endTime, roomNumber, semester } = req.body;

    const schedule = await Timetable.create({
      course,
      day,
      startTime,
      endTime,
      roomNumber,
      semester,
    });

    res.status(201).json({
      success: true,
      data: schedule,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get timetable for logged-in user
// @route   GET /api/v1/timetable/my
// @access  Private (Student, Faculty, Admin)
exports.getMyTimetable = async (req, res, next) => {
  try {
    let query = {};

    if (req.user.role === 'student') {
      // For students, fetch based on their semester or enrolled courses
      // Assuming student profile has semester info, or we fetch all for now
      // For simplicity in this demo, we'll fetch all or filter by a query param if provided
      // Ideally: const studentProfile = await StudentProfile.findOne({ user: req.user.id });
      // query.semester = studentProfile.semester;
    } else if (req.user.role === 'faculty') {
      // For faculty, fetch based on courses they teach
      const courses = await Course.find({ faculty: req.user.id });
      const courseIds = courses.map(c => c._id);
      query.course = { $in: courseIds };
    }
    // Admin sees all by default or can filter

    const timetable = await Timetable.find(query)
      .populate('course', 'title code')
      .sort({ day: 1, startTime: 1 });

    res.status(200).json({
      success: true,
      count: timetable.length,
      data: timetable,
    });
  } catch (err) {
    next(err);
  }
};
