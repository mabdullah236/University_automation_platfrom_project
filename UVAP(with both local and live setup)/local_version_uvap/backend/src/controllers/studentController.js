const StudentProfile = require('../models/StudentProfile');
const User = require('../models/User');
const Course = require('../models/Course');
const crypto = require('crypto');
const sendEmail = require('../utils/emailService');

// Helper to generate unique institutional email
const generateUniqueEmail = async (name) => {
  const parts = name.trim().split(/\s+/);
  const lastName = parts.length > 1 ? parts[parts.length - 1].toLowerCase() : parts[0].toLowerCase();
  const firstInitial = parts[0][0].toLowerCase();
  
  const baseEmail = `${firstInitial}.${lastName}@uvap.com`;
  let email = baseEmail;
  let counter = 1;

  while (await User.findOne({ uniEmail: email })) {
    email = `${firstInitial}.${lastName}${counter}@uvap.com`;
    counter++;
  }
  return email;
};

// @desc    Create new student
// @route   POST /api/v1/students
// @access  Private (Admin)
exports.createStudent = async (req, res, next) => {
  try {
    const { name, email: personalEmail, phone, program, batch, guardianName, guardianPhone, address, currentSemester } = req.body;

    // 0. Validate Required Fields
    if (!phone) return res.status(400).json({ field: 'phone', message: 'Phone number is required' });
    if (!personalEmail) return res.status(400).json({ field: 'email', message: 'Email is required' });

    // 1. Pre-Check Validation
    // Check Phone (User model)
    const userWithPhone = await User.findOne({ phone });
    if (userWithPhone) {
      return res.status(400).json({ field: 'phone', message: 'Phone already exists' });
    }

    // Check Personal Email (User model)
    const userWithEmail = await User.findOne({ personalEmail });
    if (userWithEmail) {
      return res.status(400).json({ field: 'email', message: 'This personal email is already registered.' });
    }

    // 2. Generate Institutional Email
    const institutionalEmail = await generateUniqueEmail(name);

    // 3. Create User
    const generatedPassword = crypto.randomBytes(4).toString('hex'); // 8 chars
    
    const user = await User.create({
      name,
      uniEmail: institutionalEmail, // Login ID
      personalEmail, // Notification Email
      password: generatedPassword,
      role: 'student',
      phone,
      isVerified: true,
      isFirstLogin: true
    });

    // 4. Create Profile
    // Generate Student ID (e.g., FA24-BCS-001)
    const count = await StudentProfile.countDocuments({ batch, program });
    const studentId = `${batch}-${program}-${String(count + 1).padStart(3, '0')}`;

    const student = await StudentProfile.create({
      user: user._id,
      studentId,
      program,
      batch,
      guardianName,
      guardianPhone,
      address,
      currentSemester: currentSemester || 1
    });

    // 5. Send Email
    try {
      const message = `
        <p>Welcome to UVAP! Your student account has been created successfully.</p>
        <p><strong>Your Login Credentials:</strong></p>
        <p>Login ID: <strong>${institutionalEmail}</strong></p>
        <p>Password: <strong>${generatedPassword}</strong></p>
        <p>Please login and change your password immediately.</p>
        <p><a href="http://localhost:5173/login" style="background-color: #1a73e8; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Login to Dashboard</a></p>
      `;

      await sendEmail({
        email: personalEmail, // Send to personal email
        subject: 'Welcome to UVAP - Your Login Credentials',
        message: message,
        name: name
      });

      res.status(201).json({ success: true, data: student });
    } catch (emailError) {
      console.error("EMAIL FAILED:", emailError);

      // Rollback
      await User.findByIdAndDelete(user._id);
      await StudentProfile.findOneAndDelete({ user: user._id });

      return res.status(500).json({ 
        success: false, 
        message: "User creation rolled back: Failed to send email. Check SMTP settings." 
      });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Get all students
// @route   GET /api/v1/students
// @access  Private (Admin)
// @desc    Get all students
// @route   GET /api/v1/students
// @access  Private (Admin)
exports.getAllStudents = async (req, res, next) => {
  try {
    const { keyword, department, semester, section, status } = req.query;
    
    // DEBUG LOGGING
    const fs = require('fs');
    fs.appendFileSync('query_debug.txt', `REQ QUERY: ${JSON.stringify(req.query)}\n`);

    // 1. Build Filter Object for StudentProfile
    let query = {};

    // Status Filter (Default to 'Active')
    query.studentStatus = status || 'Active';

    // Department Mapping
    if (department && department !== 'All Students') {
      const deptMap = {
        'CS': 'BSCS',
        'SE': 'BSSE',
        'BBA': 'BBA',
        'EE': 'BSEE',
        'Math': 'BSMath'
      };
      query.program = deptMap[department] || department;
    }

    // Semester Filter
    if (semester) {
      query.currentSemester = parseInt(semester);
    }

    // Section Filter
    if (section) {
      query.section = section;
    }

    // 2. Keyword Search (Complex: User fields + Profile fields)
    if (keyword) {
      // Find users matching name or email
      const users = await User.find({
        $or: [
          { name: { $regex: keyword, $options: 'i' } },
          { email: { $regex: keyword, $options: 'i' } }
        ],
        role: 'student'
      }).select('_id');
      
      const userIds = users.map(u => u._id);

      // Add to query: Match User IDs OR Roll Number (studentId)
      query.$or = [
        { user: { $in: userIds } },
        { studentId: { $regex: keyword, $options: 'i' } }
      ];
    }

    // 3. Execute Query
    const students = await StudentProfile.find(query).populate('user', 'name uniEmail personalEmail phone');
    
    res.status(200).json({ success: true, count: students.length, data: students });
  } catch (err) {
    next(err);
  }
};

// @desc    Search students
// @route   GET /api/v1/students/search
// @access  Private (Admin/Faculty)
exports.searchStudent = async (req, res, next) => {
  try {
    const { query } = req.query;
    // Find users matching name or email
    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ],
      role: 'student'
    }).select('_id');
    
    const userIds = users.map(u => u._id);

    // Find profiles matching users or roll number
    const students = await StudentProfile.find({
      $or: [
        { user: { $in: userIds } },
        { rollNumber: { $regex: query, $options: 'i' } }
      ]
    }).populate('user', 'name email phone');

    res.status(200).json({ success: true, count: students.length, data: students });
  } catch (err) {
    next(err);
  }
};

// @desc    Update student profile
// @route   PUT /api/v1/students/:id
// @access  Private (Admin)
exports.updateStudent = async (req, res, next) => {
  try {
    let student = await StudentProfile.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Separate User and Profile fields
    const { name, email, phone, ...profileData } = req.body;

    // Update User fields if provided
    if (name || email || phone) {
      const userUpdate = {};
      if (name) userUpdate.name = name;
      if (email) {
        userUpdate.email = email;
        userUpdate.personalEmail = email; // Assuming email in form is personal
      }
      if (phone) userUpdate.phone = phone;

      await User.findByIdAndUpdate(student.user, userUpdate);
    }

    // Update Profile fields
    student = await StudentProfile.findByIdAndUpdate(req.params.id, profileData, {
      new: true,
      runValidators: true
    }).populate('user', 'name email phone');

    res.status(200).json({ success: true, data: student });
  } catch (err) {
    next(err);
  }
};

// @route   PUT /api/v1/students/:id/status
// @access  Private (Admin)
exports.updateStudentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['Active', 'Archived', 'Alumni'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const student = await StudentProfile.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    student.studentStatus = status;
    await student.save();

    res.status(200).json({ success: true, data: student, message: `Student moved to ${status}` });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete student (Permanent)
// @route   DELETE /api/v1/students/:id
// @access  Private (Admin)
exports.deleteStudent = async (req, res, next) => {
  try {
    const student = await StudentProfile.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Only allow permanent delete if Archived
    if (student.studentStatus !== 'Archived') {
      return res.status(400).json({ success: false, message: 'Only Archived students can be permanently deleted.' });
    }

    const cnic = student.cnic; // Get CNIC before deletion

    await User.findByIdAndDelete(student.user);
    await student.deleteOne();

    // Sync Deletion: Update Admission Status to 'Deleted'
    const Admission = require('../models/Admission');
    await Admission.findOneAndUpdate(
      { cnic: cnic },
      { status: 'Deleted' }
    );

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};

// @desc    Get offered courses for student's semester and program
// @route   GET /api/v1/students/offered-courses
// @access  Private (Student)
exports.getOfferedCourses = async (req, res, next) => {
  try {
    const student = await StudentProfile.findOne({ user: req.user.id });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    // Fetch courses matching program and semester
    const offeredCourses = await Course.find({
      program: student.program,
      semester: student.currentSemester
    });

    // Filter out already enrolled courses
    const enrolledCourseIds = student.enrolledCourses.map(c => c.toString());
    const availableCourses = offeredCourses.filter(
      course => !enrolledCourseIds.includes(course._id.toString())
    );

    res.status(200).json({
      success: true,
      count: availableCourses.length,
      semester: student.currentSemester,
      program: student.program,
      data: availableCourses
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Self-enroll in a course
// @route   POST /api/v1/students/enroll
// @access  Private (Student)
exports.selfEnroll = async (req, res, next) => {
  try {
    const { courseId } = req.body;
    const student = await StudentProfile.findOne({ user: req.user.id });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Validation: Check Program and Semester
    if (course.program !== student.program || course.semester !== student.currentSemester) {
      return res.status(400).json({ 
        success: false, 
        message: 'You can only enroll in courses for your current program and semester' 
      });
    }

    // Validation: Check if already enrolled
    if (student.enrolledCourses.includes(courseId)) {
      return res.status(400).json({ success: false, message: 'Already enrolled in this course' });
    }

    // Enroll
    student.enrolledCourses.push(courseId);
    await student.save();

    res.status(200).json({ success: true, message: 'Enrolled successfully', data: course });
  } catch (err) {
    next(err);
  }
};

// @desc    Promote students to next semester
// @route   POST /api/v1/students/promote
// @access  Private (Admin)
exports.promoteStudents = async (req, res, next) => {
  try {
    const { batch, currentSemester } = req.body;
    const Result = require('../models/Result'); // Import Result model

    // 1. Fetch students in Batch & Semester
    const students = await StudentProfile.find({ 
      batch, 
      currentSemester: parseInt(currentSemester) 
    });

    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'No students found for this batch and semester' });
    }

    let promotedCount = 0;
    let probationCount = 0;
    let skippedCount = 0;

    // Helper to get grade points
    const getGradePoints = (grade) => {
      switch (grade) {
        case 'A': return 4.0;
        case 'B': return 3.0;
        case 'C': return 2.0;
        case 'D': return 1.0;
        case 'F': return 0.0;
        default: return 0.0;
      }
    };

    // 2. Process each student
    for (const student of students) {
      // Fetch results for this student and semester, populate course for credits
      const results = await Result.find({ 
        student: student.user, 
        semester: currentSemester.toString() 
      }).populate('course');

      // Edge Case: No results -> Do not promote
      if (results.length === 0) {
        skippedCount++;
        continue;
      }

      // Calculate GPA
      let totalPoints = 0;
      let totalCredits = 0;
      let hasFailure = false;

      results.forEach(r => {
        if (r.grade === 'F') hasFailure = true;
        const points = getGradePoints(r.grade);
        const credits = r.course ? r.course.credits : 3; // Default to 3 if course not found (fallback)
        totalPoints += points * credits;
        totalCredits += credits;
      });

      const gpa = totalCredits > 0 ? (totalPoints / totalCredits) : 0;

      // Promotion Logic: Pass all subjects OR GPA > 2.0
      if (!hasFailure || gpa > 2.0) {
        // Promoted
        student.currentSemester += 1;
        student.promotionStatus = 'Promoted';
        promotedCount++;
      } else {
        // Probation (Fail AND GPA <= 2.0)
        student.currentSemester += 1;
        student.promotionStatus = 'Probation';
        probationCount++;
      }

      await student.save();
    }

    res.status(200).json({ 
      success: true, 
      message: `Promotion complete. Promoted: ${promotedCount}, Probation: ${probationCount}, Skipped: ${skippedCount}`,
      data: { promotedCount, probationCount, skippedCount }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Auto-assign sections to students
// @route   POST /api/v1/students/sectioning
// @access  Private (Admin)
exports.autoAssignSections = async (req, res, next) => {
  try {
    const { batch, program, maxStudents, currentSemester, force } = req.body;

    if (!batch || !program || !maxStudents || !currentSemester) {
      return res.status(400).json({ success: false, error: 'Please provide batch, program, maxStudents, and currentSemester' });
    }

    // 1. Check for existing sections if not forced
    if (!force) {
      const existingSections = await StudentProfile.findOne({
        batch,
        program,
        currentSemester,
        section: { $ne: null } // Check if any section is assigned
      });

      if (existingSections) {
        return res.status(409).json({
          success: false,
          error: 'Sections already exist for this batch. Do you want to overwrite?',
          requiresConfirmation: true
        });
      }
    }

    // 2. Fetch all students matching Batch, Program & Semester
    const students = await StudentProfile.find({ batch, program, currentSemester }).sort({ admissionDate: 1 }); // Sort by admission date

    if (students.length === 0) {
      return res.status(404).json({ success: false, error: 'No students found for this batch, program, and semester' });
    }

    const totalStudents = students.length;
    const numSections = Math.ceil(totalStudents / maxStudents);
    const sections = [];
    
    // Generate section names (E1, E2, E3...)
    for (let i = 1; i <= numSections; i++) {
      sections.push(`E${i}`);
    }

    let updatedCount = 0;
    
    // UOS Roll No Format: {Program}-{Section}-{BatchShort}-{Sequence}
    // Example: BSCS-E1-23-1
    
    // Extract Batch Short (e.g., "Fall 2023" -> "23")
    const yearMatch = batch.match(/\d{4}/);
    const startYear = yearMatch ? parseInt(yearMatch[0]) : new Date().getFullYear();
    const startYearShort = startYear.toString().slice(-2);

    // Counters for each section to track sequence
    const sectionCounters = {};
    sections.forEach(sec => sectionCounters[sec] = 1);

    // 3. Loop through students and update section & Roll No
    for (let i = 0; i < totalStudents; i++) {
      const sectionIndex = Math.floor(i / maxStudents);
      const sectionName = sections[sectionIndex];
      
      // Generate Roll No
      const sequence = sectionCounters[sectionName]++;
      // No padding for sequence as per UOS format (1, 2, 3...)
      
      // Final Format: BSCS-E1-23-1
      const finalRollNo = `${program}-${sectionName}-${startYearShort}-${sequence}`;

      const student = students[i];
      student.section = sectionName;
      student.studentId = finalRollNo; // Update Profile ID
      await student.save();

      // Update User Model Roll No
      await User.findByIdAndUpdate(student.user, { rollNumber: finalRollNo });

      updatedCount++;
    }

    res.status(200).json({
      success: true,
      message: `${updatedCount} Students distributed into ${numSections} Sections (${sections.join(', ')}). Roll Numbers Generated (UOS Format).`,
      data: {
        totalStudents,
        numSections,
        sections
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Section Statistics
// @route   GET /api/v1/students/sections/stats
// @access  Private (Admin)
exports.getSectionStats = async (req, res, next) => {
  try {
    const stats = await StudentProfile.aggregate([
      {
        $group: {
          _id: {
            program: '$program',
            batch: '$batch',
            semester: '$currentSemester',
            section: '$section'
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: {
          '_id.program': 1,
          '_id.batch': 1,
          '_id.semester': 1,
          '_id.section': 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      count: stats.length,
      data: stats
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a Section (Reset to default 'A')
// @route   POST /api/v1/students/sections/delete
// @access  Private (Admin)
exports.deleteSection = async (req, res, next) => {
  try {
    const { batch, program, semester, section } = req.body;

    if (!batch || !program || !semester || !section) {
      return res.status(400).json({ success: false, error: 'Please provide batch, program, semester, and section' });
    }

    const result = await StudentProfile.updateMany(
      { batch, program, currentSemester: semester, section },
      { $set: { section: 'A' } }
    );

    res.status(200).json({
      success: true,
      message: `Section ${section} deleted. ${result.modifiedCount} students moved to default section 'A'.`
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Merge Sections
// @route   POST /api/v1/students/sections/merge
// @access  Private (Admin)
exports.mergeSections = async (req, res, next) => {
  try {
    const { batch, program, semester, sourceSection, targetSection } = req.body;

    if (!batch || !program || !semester || !sourceSection || !targetSection) {
      return res.status(400).json({ success: false, error: 'Please provide all required fields' });
    }

    const result = await StudentProfile.updateMany(
      { batch, program, currentSemester: semester, section: sourceSection },
      { $set: { section: targetSection } }
    );

    res.status(200).json({
      success: true,
      message: `Merged ${sourceSection} into ${targetSection}. ${result.modifiedCount} students updated.`
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Active Sections for Program & Semester
// @route   GET /api/v1/students/active-sections
// @access  Private (Admin)
exports.getActiveSections = async (req, res, next) => {
  try {
    const { program, semester } = req.query;

    if (!program || !semester) {
      return res.status(400).json({ success: false, error: 'Please provide program and semester' });
    }

    const sections = await StudentProfile.distinct('section', {
      program,
      currentSemester: semester
    });

    // Sort alphabetically
    const sortedSections = sections.sort();

    res.status(200).json({
      success: true,
      data: sortedSections
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Run Promotion Cycle (Strict Rules)
// @route   POST /api/v1/students/promotion/run
// @access  Private (Admin)
exports.runPromotionCycle = async (req, res, next) => {
  try {
    const { batch, semester } = req.body;
    const Result = require('../models/Result');

    if (!batch || !semester) {
      return res.status(400).json({ success: false, message: 'Batch and Semester are required' });
    }

    const students = await StudentProfile.find({ 
      batch, 
      currentSemester: parseInt(semester),
      studentStatus: 'Active' // Only process active students
    });

    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'No active students found for this batch and semester' });
    }

    let stats = {
      promoted: 0,
      graduated: 0,
      dropped: 0,
      repeated: 0,
      total: students.length
    };

    const getGradePoints = (grade) => {
      switch (grade) {
        case 'A': return 4.0;
        case 'B': return 3.0;
        case 'C': return 2.0;
        case 'D': return 1.0;
        case 'F': return 0.0;
        default: return 0.0;
      }
    };

    for (const student of students) {
      // Fetch Results
      const results = await Result.find({ 
        student: student.user, 
        semester: semester.toString() 
      }).populate('course');

      // Calculate Stats
      let totalPoints = 0;
      let totalCredits = 0;
      let supplies = 0;

      results.forEach(r => {
        if (r.grade === 'F') supplies++;
        const points = getGradePoints(r.grade);
        const credits = r.course ? r.course.credits : 3;
        totalPoints += points * credits;
        totalCredits += credits;
      });

      const cgpa = totalCredits > 0 ? (totalPoints / totalCredits) : 0; // Using SGPA as proxy for CGPA for now

      // Logic
      const isPass = cgpa >= 2.0 && supplies < 3;

      if (isPass) {
        if (student.currentSemester === 8) {
          // Graduate
          student.studentStatus = 'Alumni';
          student.promotionStatus = 'Promoted'; // Graduated
          stats.graduated++;
        } else {
          // Promote
          student.currentSemester += 1;
          student.promotionStatus = 'Promoted';
          stats.promoted++;
        }
      } else {
        // Fail
        if (student.currentSemester <= 4) {
          // Junior Rule: Drop
          student.studentStatus = 'Archived';
          student.promotionStatus = 'Detained'; // Dropped
          stats.dropped++;
        } else {
          // Senior Rule: Repeat
          // Do NOT increment semester
          student.promotionStatus = 'Probation'; // Repeating
          stats.repeated++;
        }
      }

      await student.save();
    }

    res.status(200).json({ 
      success: true, 
      message: `Promotion Cycle Complete.`,
      data: stats
    });

  } catch (err) {
    next(err);
  }
};
