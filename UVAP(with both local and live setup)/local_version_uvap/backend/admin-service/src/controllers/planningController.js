const StudentProfile = require('../models/StudentProfile');
const Course = require('../models/Course');
const SystemConfig = require('../models/SystemConfig');
const Room = require('../models/Room');
const FacultyProfile = require('../models/FacultyProfile');

// @desc    Get Resource Forecast
// @route   POST /api/v1/planning/forecast
// @access  Private (Admin)
exports.getForecast = async (req, res, next) => {
  try {
    const { maxTeacherLoad = 3, workingDays = 5 } = req.body;

    const config = await SystemConfig.findOne();
    const activeSession = config ? config.activeSession : 'Fall';
    
    // Determine Allowed Semesters
    const allowedSemesters = activeSession === 'Fall' ? [1, 3, 5, 7] : [2, 4, 6, 8];

    // 1. Aggregation Pipeline for Students
    // Goal: Group by Program, Semester, Shift (Case Insensitive)
    const studentStats = await StudentProfile.aggregate([
      // Step A: Filter Active Students AND Active Semesters
      { 
        $match: { 
          studentStatus: 'Active',
          currentSemester: { $in: allowedSemesters }
        } 
      },

      // Step B: Normalize Shift (Handle missing & Case)
      {
        $addFields: {
          shiftNormalized: {
            $toLower: { $ifNull: ["$shift", "Morning"] }
          }
        }
      },

      // Step C: Grouping
      {
        $group: {
          _id: {
            program: "$program",
            semester: "$currentSemester",
            shift: "$shiftNormalized"
          },
          studentCount: { $sum: 1 },
          uniqueSections: { $addToSet: "$section" }
        }
      },

      // Step D: Project for readability
      {
        $project: {
          _id: 0,
          program: "$_id.program",
          semester: "$_id.semester",
          shift: "$_id.shift",
          studentCount: 1,
          uniqueSections: 1
        }
      }
    ]);

    if (!studentStats || studentStats.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No active students found for the ${activeSession} session (Semesters ${allowedSemesters.join(', ')}). Please ensure students are promoted or enrolled correctly.`
      });
    }

    // 2. Fetch Course Counts per Semester
    const allCourses = await Course.find({});
    const courseMap = {}; // { "PROGRAM-SEMESTER": Set(titles) }

    allCourses.forEach(c => {
      // Normalize Key: UPPERCASE-STRING
      const program = c.program ? c.program.trim().toUpperCase() : 'UNKNOWN';
      const semester = c.semester ? c.semester.toString() : '0';
      const key = `${program}-${semester}`;

      if (!courseMap[key]) {
        courseMap[key] = new Set();
      }
      // Use title (normalized) to count unique courses
      courseMap[key].add(c.title.trim()); 
    });

    // 3. Process Data & Calculate Requirements
    let morningHoursNeeded = 0;
    let eveningHoursNeeded = 0;
    let totalSectionsMorning = 0;
    let totalSectionsEvening = 0;

    const breakdown = studentStats.map(group => {
      // Normalize Shift for Display (Title Case)
      // "evening" -> "Evening", "morning" -> "Morning"
      const rawShift = group.shift || 'morning';
      const displayShift = rawShift.charAt(0).toUpperCase() + rawShift.slice(1);

      // Normalize Lookup Key
      const program = group.program ? group.program.trim().toUpperCase() : 'UNKNOWN';
      const semester = group.semester ? group.semester.toString() : '0';
      const courseKey = `${program}-${semester}`;
      
      const titles = courseMap[courseKey] ? Array.from(courseMap[courseKey]) : [];
      const courseCount = titles.length; // No default, show actual count

      // Filter out null/empty sections from the set
      const validSections = group.uniqueSections.filter(s => s);
      const actualSections = validSections.length;

      let hoursNeeded = 0;
      let teachersForGroup = 0;
      let missingSections = false;

      if (actualSections === 0) {
        missingSections = true;
      } else {
        hoursNeeded = actualSections * courseCount;
        // Use exact FTE (Full Time Equivalent) to ensure totals match
        teachersForGroup = Number((hoursNeeded / maxTeacherLoad).toFixed(2));
      }

      // Accumulate Totals
      if (displayShift === 'Morning') {
        morningHoursNeeded += hoursNeeded;
        totalSectionsMorning += actualSections;
      } else {
        eveningHoursNeeded += hoursNeeded;
        totalSectionsEvening += actualSections;
      }

      return {
        program: group.program,
        semester: group.semester,
        shift: displayShift,
        studentCount: group.studentCount,
        actualSections,
        courseCount,
        courseTitles: titles,
        hoursNeeded,
        teachersRequired: teachersForGroup,
        missingSections
      };
    });

    // 4. Calculate Global Totals
    const slotsPerWeek = 6 * workingDays;
    const morningRooms = Math.ceil(morningHoursNeeded / slotsPerWeek);
    const eveningRooms = Math.ceil(eveningHoursNeeded / slotsPerWeek);
    const roomsRequired = Math.max(morningRooms, eveningRooms);

    const totalTeachingLoad = morningHoursNeeded + eveningHoursNeeded;
    const totalTeachersRequired = Math.ceil(totalTeachingLoad / maxTeacherLoad);

    // 5. Fetch Available Resources
    const availableRooms = await Room.countDocuments({});
    const availableTeachers = await FacultyProfile.countDocuments({});

    // Sort Breakdown: Program (A-Z) -> Semester (Asc)
    breakdown.sort((a, b) => {
      if (a.program < b.program) return -1;
      if (a.program > b.program) return 1;
      return a.semester - b.semester;
    });

    res.status(200).json({
      success: true,
      data: {
        inputs: { maxTeacherLoad, workingDays, activeSession },
        results: {
          roomsRequired,
          teachersRequired: totalTeachersRequired,
          morningPeak: morningRooms,
          eveningPeak: eveningRooms,
          totalSections: totalSectionsMorning + totalSectionsEvening,
          morningSections: totalSectionsMorning,
          eveningSections: totalSectionsEvening,
          totalTeachingLoad,
          availableRooms,
          availableTeachers
        },
        breakdown
      }
    });

  } catch (err) {
    next(err);
  }
};
