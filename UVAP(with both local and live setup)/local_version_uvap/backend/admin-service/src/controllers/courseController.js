const Course = require('../models/Course');
const CourseAllocation = require('../models/CourseAllocation');
const allocationService = require('../services/allocationService');

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
    // Code must be unique within the Department, Program AND Semester
    if (code) {
      const existingCode = await Course.findOne({ code, department, program, semester });
      if (existingCode) {
        return res.status(400).json({ success: false, error: 'Course Code already exists in this Semester.' });
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
    if (req.query.unassigned === 'true') query.teacher = null;

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
// @desc    Get Allocation Data (Courses, Faculty, Existing Allocations)
// @route   GET /api/v1/courses/allocations/data
// @access  Private (Admin)
exports.getAllocationData = async (req, res, next) => {
  try {
    const { program, semester, section, batch, unassigned } = req.query;

    // If unassigned=true, we only strictly need batch (or even just program) to narrow it down, 
    // but let's keep batch as minimum requirement for now to avoid fetching too much.
    if (!batch && !unassigned) {
       // Instead of 400, return empty success to allow "Global" state on frontend without error
       return res.status(200).json({ 
           success: true, 
           data: { courses: [], faculty: [], allocations: [] } 
       });
    }

    // 1. Fetch Courses for this Program/Semester
    // 1. Fetch Courses for this Program/Semester
    const courseQuery = {};
    if (program) courseQuery.program = program;
    if (semester) courseQuery.semester = parseInt(semester);
    
    // SMART FILTER: If only batch is provided, find relevant courses for that batch
    if (batch && !program && !semester) {
       const { scopes } = await allocationService.getActiveScopes(batch);
       if (scopes.length > 0) {
           const orConditions = scopes.map(s => {
               const [p, sem] = s.split('|');
               return { program: p, semester: parseInt(sem) };
           });
           courseQuery.$or = orConditions;
       } else {
           // If no scopes found, maybe return empty or all? 
           // Let's return empty to avoid flooding UI
           courseQuery._id = null; // Force empty
       }
    }
    
    const courses = await Course.find(courseQuery);

    // 3. Fetch Existing Allocations for THIS Section
    const allocationQuery = { batch };
    if (program) allocationQuery.program = program;
    if (semester) allocationQuery.semester = parseInt(semester);
    if (section) allocationQuery.section = section;

    const allocations = await CourseAllocation.find(allocationQuery);

    // 4. Fetch Faculty (Active + Assigned)
    // We need to ensure we fetch faculty who are assigned, even if they are not 'Active'
    const assignedTeacherIds = allocations.map(a => a.teacher).filter(id => id);
    
    const FacultyProfile = require('../models/FacultyProfile');
    const faculty = await FacultyProfile.find({
        $or: [
            { status: 'Active' },
            { user: { $in: assignedTeacherIds } }
        ]
    }).populate('user', 'name email');

    // 5. Calculate Current Load for Each Faculty (Global Load across all sections)
    const allAllocations = await CourseAllocation.find({ batch }); // Load for this batch (semester)
    
    const teacherLoadMap = {};
    allAllocations.forEach(a => {
      if (a.teacher) {
        const tid = a.teacher.toString();
        teacherLoadMap[tid] = (teacherLoadMap[tid] || 0) + 1;
      }
    });

    const facultyWithLoad = faculty.map(f => ({
      _id: f._id,
      user: f.user,
      department: f.department,
      // Use User ID for load lookup because CourseAllocation stores User ID
      currentLoad: teacherLoadMap[f.user._id.toString()] || 0,
      maxLoad: 6, // Updated max load
      specialization: f.specialization,
      qualifications: f.qualifications
    }));

    res.status(200).json({
      success: true,
      data: {
        courses,
        faculty: facultyWithLoad,
        allocations
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Auto-Allocate Teachers (Smart Logic)
// @route   POST /api/v1/courses/allocations/auto
// @access  Private (Admin)
exports.autoAllocate = async (req, res, next) => {
  try {
    const { program, semester, section, batch } = req.body;

    if (!program || !semester || !section || !batch) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // 1. Fetch Data
    const query = { batch };
    if (program) query.program = program;
    if (semester) query.semester = parseInt(semester);
    if (section) query.section = section;
    
    // If unassigned requested, we want allocations where teacher is null
    // But wait, getAllocationData returns 'courses' and 'allocations'.
    // If we want to show unassigned courses, we need to find courses that DO NOT have an allocation OR have an allocation with teacher=null.
    // This is complex for this specific endpoint structure.
    // Let's stick to the existing structure: return ALL courses for the scope, and let frontend filter?
    // OR: If unassigned=true, we might need a different strategy.
    
    // Actually, the user wants to see "courses and section in which teacher not assign".
    // This implies we need to return a list of (Course + Section) tuples that are unassigned.
    
    // Let's adjust the Course fetch:
    const courseQuery = {};
    if (program) courseQuery.program = program;
    if (semester) courseQuery.semester = parseInt(semester);
    
    const courses = await Course.find(courseQuery);
    const FacultyProfile = require('../models/FacultyProfile');
    // Fetch Active faculty and populate user for name checking if needed
    const faculty = await FacultyProfile.find({ status: 'Active' }).populate('user', 'name'); 
    
    // 2. Calculate Current Global Load
    const allAllocations = await CourseAllocation.find({ batch }); 
    const teacherLoadMap = {};
    allAllocations.forEach(a => {
      if (a.teacher) {
        const tid = a.teacher.toString();
        teacherLoadMap[tid] = (teacherLoadMap[tid] || 0) + 1;
      }
    });

    const allocationsToSave = [];
    const MAX_LOAD = 6;

    // Helper: Calculate Match Score
    const calculateScore = (teacher, course, currentLoad) => {
      let score = 0;

      // 1. Specialization Match (+100)
      const courseTitle = course.title.toLowerCase();
      const specialization = (teacher.specialization || '').toLowerCase();
      const qualification = (teacher.qualifications && teacher.qualifications[0] ? teacher.qualifications[0].degree : '').toLowerCase();
      const dept = teacher.department.toLowerCase();

      const mathKeywords = ['math', 'calculus', 'algebra', 'stat', 'differential', 'numerical', 'geometry', 'trigonometry'];
      const islamiyatKeywords = ['islam', 'quran', 'arabic', 'ethics'];
      const pakStudyKeywords = ['pakistan studies', 'history', 'pak study', 'pakistan'];
      const physicsKeywords = ['physics', 'mechanics', 'thermodynamics', 'quantum', 'electronics'];
      const englishKeywords = ['english', 'communication', 'writing', 'literature', 'comprehension'];
      const csKeywords = ['computer', 'software', 'data', 'web', 'network', 'programming', 'algorithm', 'database', 'ai', 'machine learning'];

      const isMathCourse = mathKeywords.some(k => courseTitle.includes(k));
      const isIslamCourse = islamiyatKeywords.some(k => courseTitle.includes(k));
      const isPakStudyCourse = pakStudyKeywords.some(k => courseTitle.includes(k));
      const isPhysicsCourse = physicsKeywords.some(k => courseTitle.includes(k));
      const isEnglishCourse = englishKeywords.some(k => courseTitle.includes(k));
      const isCsCourse = csKeywords.some(k => courseTitle.includes(k));

      const hasMathSpec = mathKeywords.some(k => specialization.includes(k) || qualification.includes(k) || dept.includes('math'));
      const hasIslamSpec = islamiyatKeywords.some(k => specialization.includes(k) || qualification.includes(k) || dept.includes('islam') || dept.includes('arabic'));
      const hasPakStudySpec = pakStudyKeywords.some(k => specialization.includes(k) || qualification.includes(k) || dept.includes('pakistan'));
      const hasPhysicsSpec = physicsKeywords.some(k => specialization.includes(k) || qualification.includes(k) || dept.includes('physics'));
      const hasEnglishSpec = englishKeywords.some(k => specialization.includes(k) || qualification.includes(k) || dept.includes('english'));
      const hasCsSpec = csKeywords.some(k => specialization.includes(k) || qualification.includes(k) || dept.includes('computer') || dept.includes('software'));

      if (isMathCourse && hasMathSpec) score += 100;
      else if (isMathCourse && !hasMathSpec) score -= 50; 

      if (isIslamCourse && hasIslamSpec) score += 100;
      else if (isIslamCourse && !hasIslamSpec) score -= 50;

      if (isPakStudyCourse && hasPakStudySpec) score += 100;
      else if (isPakStudyCourse && !hasPakStudySpec) score -= 50;

      if (isPhysicsCourse && hasPhysicsSpec) score += 100;
      else if (isPhysicsCourse && !hasPhysicsSpec) score -= 50;

      if (isEnglishCourse && hasEnglishSpec) score += 100;
      else if (isEnglishCourse && !hasEnglishSpec) score -= 50;

      if (isCsCourse && hasCsSpec) score += 50;

      // 2. Department Match (+20)
      if (teacher.department === course.department || teacher.department === program) {
        score += 20;
      }

      // 3. Load Balancing
      if (currentLoad >= MAX_LOAD) {
        score -= 1000; // Heavy penalty for overload
      } else {
        score += (MAX_LOAD - currentLoad) * 10;
      }

      return score;
    };

    // 3. Allocation Logic
    for (const course of courses) {
      // Find existing allocation for this specific section/course
      const existingAllocation = await CourseAllocation.findOne({
        course: course._id,
        section,
        batch
      });

      let currentTeacherId = existingAllocation ? existingAllocation.teacher.toString() : null;
      let bestTeacher = null;
      let bestScore = -Infinity;

      // Score all faculty
      for (const teacher of faculty) {
        // Use User ID for load lookup
        const currentLoad = teacherLoadMap[teacher.user._id.toString()] || 0;
        const score = calculateScore(teacher, course, currentLoad);

        if (score > bestScore) {
          bestScore = score;
          bestTeacher = teacher;
        }
      }

      // Decision Time
      if (bestTeacher) {
        // Use User ID for assignment
        const bestTeacherId = bestTeacher.user._id.toString();
        
        // If we have a winner
        if (bestTeacherId !== currentTeacherId) {
          
          // Decrement load of old teacher (if any)
          if (currentTeacherId) {
          }

          // Increment load of new teacher
          teacherLoadMap[bestTeacherId] = (teacherLoadMap[bestTeacherId] || 0) + 1;

          // Add to save list (Upsert)
          allocationsToSave.push({
            updateOne: {
              filter: { course: course._id, section, batch },
              update: { 
                teacher: bestTeacher.user._id, // Save User ID
                semester,
                program,
                batch
              },
              upsert: true
            }
          });
        }
      }
    }

    // 4. Bulk Write
    if (allocationsToSave.length > 0) {
      await CourseAllocation.bulkWrite(allocationsToSave);
    }

    res.status(200).json({ 
      success: true, 
      message: `Smart Auto-Allocation Complete. Processed ${courses.length} courses. Updates: ${allocationsToSave.length}.`,
      data: allocationsToSave 
    });

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

// @desc    Get Allocation Report (Master Sheet)
// @route   GET /api/v1/courses/allocations/report
// @access  Private (Admin)
exports.getAllocationReport = async (req, res, next) => {
  try {
    const { program, batch, semester, shift, section } = req.query;

    const query = {};
    if (program) query.program = program;
    if (batch) query.batch = batch;
    if (semester) query.semester = semester;
    if (section) query.section = section;

    // 1. Fetch Allocations
    const allocations = await CourseAllocation.find(query)
      .populate('course', 'title code')
      .populate('teacher', 'name uniEmail')
      .sort({ section: 1, 'course.code': 1 });

    // 2. Fetch Active Sections (from Students)
    const StudentProfile = require('../models/StudentProfile');
    const sectionQuery = {
      program,
      batch,
      currentSemester: semester
    };
    
    let activeSections = await StudentProfile.distinct('section', sectionQuery);
    
    // Filter by specific section if requested
    if (section) {
      activeSections = activeSections.filter(s => s === section);
    }
    
    // Filter by shift if requested
    if (shift) {
      const prefix = shift === 'Morning' ? 'M' : 'E';
      activeSections = activeSections.filter(s => s.startsWith(prefix));
    }
    
    // 3. Fetch Courses (Curriculum)
    const courses = await Course.find({ program, semester: parseInt(semester) }).sort({ code: 1 });

    res.status(200).json({
      success: true,
      data: {
        allocations,
        sections: activeSections.sort(),
        courses
      }
    });
  } catch (err) {
    next(err);
  }
};
// @desc    Get Allocations for a specific Teacher
// @route   GET /api/v1/courses/allocations/teacher/:teacherId
// @access  Private (Admin)
exports.getTeacherAllocations = async (req, res, next) => {
  try {
    const { teacherId } = req.params;

    const allocations = await CourseAllocation.find({ teacher: teacherId })
      .populate('course', 'title code credits')
      .sort({ program: 1, semester: 1, section: 1 });

    res.status(200).json({
      success: true,
      count: allocations.length,
      data: allocations
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Auto-assign all unassigned courses
// @route   POST /api/courses/allocations/auto-assign
// @access  Private (Admin)
exports.autoAssignAllCourses = async (req, res, next) => {
  try {
    const { batch, program, semester, section } = req.body;
    // Batch is now optional (Global Auto-Assign)
    
    const { results, logs } = await allocationService.autoAssignAll(batch, program, semester, section);

    res.status(200).json({
      success: true,
      count: results.length,
      data: results,
      logs, // Send debug logs to frontend
      message: `Auto-assigned ${results.length} courses`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error', error: err.message });
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

exports.cleanupMalformedCourses = async (req, res, next) => {
  try {
    const Course = require('../models/Course');
    const result = await Course.deleteMany({
        $or: [
            { code: { $exists: false } },
            { code: null },
            { code: '' },
            { title: { $exists: false } },
            { title: null },
            { title: '' }
        ]
    });
    res.status(200).json({ success: true, deletedCount: result.deletedCount, message: `Deleted ${result.deletedCount} malformed courses` });
  } catch (err) {
    next(err);
  }
};


