const Attendance = require('../models/Attendance');
const Course = require('../models/Course');
const User = require('../models/User');

// @desc    Mark attendance for a class
// @route   POST /api/v1/attendance/mark
// @access  Private (Faculty)
exports.markAttendance = async (req, res, next) => {
  try {
    const { courseId, date, students } = req.body; // students: [{ studentId, status }]

    // Validate course ownership (optional but recommended)
    // const course = await Course.findById(courseId);
    // if (course.faculty.toString() !== req.user.id) { ... }

    const attendanceRecords = [];

    for (const record of students) {
      // Upsert attendance record
      await Attendance.findOneAndUpdate(
        { course: courseId, student: record.studentId, date: new Date(date) },
        { status: record.status },
        { upsert: true, new: true }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Attendance marked successfully',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get attendance for a student (My Attendance)
// @route   GET /api/v1/attendance/my
// @access  Private (Student)
exports.getMyAttendance = async (req, res, next) => {
  try {
    const attendance = await Attendance.find({ student: req.user.id })
      .populate('course', 'name code')
      .sort({ date: -1 });

    // Calculate percentage per course
    const courseStats = {};
    
    attendance.forEach(record => {
      const courseId = record.course._id.toString();
      if (!courseStats[courseId]) {
        courseStats[courseId] = {
          courseName: record.course.name,
          courseCode: record.course.code,
          total: 0,
          present: 0,
          absent: 0,
          late: 0
        };
      }
      
      courseStats[courseId].total++;
      if (record.status === 'Present') courseStats[courseId].present++;
      else if (record.status === 'Absent') courseStats[courseId].absent++;
      else if (record.status === 'Late') courseStats[courseId].late++;
    });

    const stats = Object.values(courseStats).map(stat => ({
      ...stat,
      percentage: ((stat.present + stat.late) / stat.total) * 100 // Assuming Late counts as present for % or maybe 0.5? Keeping simple.
    }));

    res.status(200).json({
      success: true,
      data: attendance,
      stats: stats
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get attendance for a specific course (Faculty View)
// @route   GET /api/v1/attendance/course/:courseId
// @access  Private (Faculty)
exports.getCourseAttendance = async (req, res, next) => {
  try {
    const { date } = req.query;
    const query = { course: req.params.courseId };
    if (date) {
      query.date = new Date(date);
    }

    const attendance = await Attendance.find(query)
      .populate('student', 'name rollNumber email')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: attendance.length,
      data: attendance
    });
  } catch (err) {
    next(err);
  }
};
