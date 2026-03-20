const StudentProfile = require('../models/StudentProfile');
const Course = require('../models/Course');

// @desc    Get Resource Forecast
// @route   POST /api/v1/planning/forecast
// @access  Private (Admin)
exports.getForecast = async (req, res, next) => {
  try {
    const { maxTeacherLoad = 3, sectionSize = 50, workingDays = 5 } = req.body;

    // 1. Fetch Active Students
    const students = await StudentProfile.find({ studentStatus: 'Active' });

    // 2. Group Data by Program, Semester, Shift
    const groupedData = {};

    students.forEach(student => {
      const key = `${student.program}-${student.currentSemester}-${student.shift}`;
      if (!groupedData[key]) {
        groupedData[key] = {
          program: student.program,
          semester: student.currentSemester,
          shift: student.shift,
          count: 0
        };
      }
      groupedData[key].count++;
    });

    // 3. Calculate Workload
    let morningHoursNeeded = 0;
    let eveningHoursNeeded = 0;
    let totalSectionsMorning = 0;
    let totalSectionsEvening = 0;

    const breakdown = [];

    // Helper to get average courses per semester (simplified)
    // In a real scenario, we might query the Course model for exact counts per program/semester
    // For now, we'll fetch all courses and build a map
    const allCourses = await Course.find({});
    const courseMap = {}; // { "Program-Semester": count }

    allCourses.forEach(c => {
      const key = `${c.program}-${c.semester}`;
      courseMap[key] = (courseMap[key] || 0) + 1;
    });

    for (const key in groupedData) {
      const group = groupedData[key];
      const courseKey = `${group.program}-${group.semester}`;
      const avgCourses = courseMap[courseKey] || 5; // Default to 5 if no courses found

      const sections = Math.ceil(group.count / sectionSize);
      const hours = sections * avgCourses;

      if (group.shift === 'Morning') {
        morningHoursNeeded += hours;
        totalSectionsMorning += sections;
      } else {
        eveningHoursNeeded += hours;
        totalSectionsEvening += sections;
      }

      breakdown.push({
        ...group,
        sections,
        hoursNeeded: hours,
        avgCourses
      });
    }

    // 4. Calculate Rooms (Infrastructure)
    const slotsPerWeek = 6 * workingDays; // 6 hours per day
    const morningRooms = Math.ceil(morningHoursNeeded / slotsPerWeek);
    const eveningRooms = Math.ceil(eveningHoursNeeded / slotsPerWeek);
    const roomsRequired = Math.max(morningRooms, eveningRooms);

    // 5. Calculate Teachers (HR)
    const totalTeachingLoad = morningHoursNeeded + eveningHoursNeeded;
    const teachersRequired = Math.ceil(totalTeachingLoad / maxTeacherLoad);

    res.status(200).json({
      success: true,
      data: {
        inputs: { maxTeacherLoad, sectionSize, workingDays },
        results: {
          roomsRequired,
          teachersRequired,
          morningPeak: morningRooms,
          eveningPeak: eveningRooms,
          totalSections: totalSectionsMorning + totalSectionsEvening,
          morningSections: totalSectionsMorning,
          eveningSections: totalSectionsEvening,
          totalTeachingLoad
        },
        breakdown
      }
    });

  } catch (err) {
    next(err);
  }
};
