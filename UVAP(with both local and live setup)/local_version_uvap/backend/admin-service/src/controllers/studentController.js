const StudentProfile = require('../models/StudentProfile');
const User = require('../models/User');
const Course = require('../models/Course');
const CourseAllocation = require('../models/CourseAllocation');
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

// @desc    Create new student (User + Profile)
// @route   POST /api/v1/students
// @access  Private (Admin)
exports.createStudent = async (req, res, next) => {
  try {
    const { name, email: personalEmail, phone, program, batch, section, shift, admissionDate, cnic, address, gender, dob, guardianName, guardianPhone, guardianRelation } = req.body;

    // 0. Validate Required Fields
    if (!phone) return res.status(400).json({ field: 'phone', message: 'Phone number is required' });
    if (!cnic) return res.status(400).json({ field: 'cnic', message: 'CNIC is required' });
    if (!program) return res.status(400).json({ field: 'program', message: 'Program is required' });
    if (!batch) return res.status(400).json({ field: 'batch', message: 'Batch is required' });

    // 1. Pre-Check Validation (CNIC & Phone)
    const existingUser = await User.findOne({ 
      $or: [{ phone }, { personalEmail }] 
    });

    if (existingUser) {
      let field = existingUser.phone === phone ? 'Phone Number' : 'Personal Email';
      let role = existingUser.role.charAt(0).toUpperCase() + existingUser.role.slice(1);
      return res.status(400).json({ field: field.toLowerCase().includes('phone') ? 'phone' : 'email', message: `This ${field} is already registered by a ${role}.` });
    }

    const existingStudentProfile = await StudentProfile.findOne({ cnic });
    if (existingStudentProfile) {
      return res.status(400).json({ field: 'cnic', message: 'This CNIC is already registered by a Student.' });
    }

    const existingFacultyProfile = await require('../models/FacultyProfile').findOne({ cnic });
    if (existingFacultyProfile) {
      return res.status(400).json({ field: 'cnic', message: 'This CNIC is already registered by a Faculty Member.' });
    }

    // 2. Generate Institutional Email
    const institutionalEmail = await generateUniqueEmail(name);

    // 3. Generate Roll Number
    const rollNumber = `${program}-${batch}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 4. Create User
    const generatedPassword = crypto.randomBytes(4).toString('hex');
    
    const user = await User.create({
      name,
      uniEmail: institutionalEmail,
      personalEmail,
      password: generatedPassword,
      role: 'student',
      phone,
      rollNumber,
      isVerified: true,
      isFirstLogin: true
    });

    // 5. Create Profile
    const profile = await StudentProfile.create({
      user: user._id,
      studentId: rollNumber,
      program,
      batch,
      section: section || 'Unassigned',
      shift: shift || 'Morning',
      currentSemester: 1,
      admissionDate: admissionDate || Date.now(),
      cnic,
      address,
      gender,
      dob,
      guardianName,
      guardianPhone,
      guardianRelation
    });

    // 6. Send Email via Notification Service
    try {
      const message = `
        <p>Welcome to UVAP! Your student account has been created.</p>
        <p><strong>Your Login Credentials:</strong></p>
        <p>Login ID: <strong>${institutionalEmail}</strong></p>
        <p>Password: <strong>${generatedPassword}</strong></p>
        <p>Please login and change your password immediately.</p>
        <p><a href="http://localhost:5173/login" style="background-color: #1a73e8; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Login to Dashboard</a></p>
      `;

      await sendEmail({
        to: personalEmail,
        subject: 'Welcome to UVAP - Your Login Credentials',
        html: message,
        name: name
      });

      res.status(201).json({ success: true, data: { user, profile } });
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
    const { keyword, department, semester, section, status, batch } = req.query;
    
    // DEBUG LOGGING
    const fs = require('fs');
    fs.appendFileSync('query_debug.txt', `REQ QUERY: ${JSON.stringify(req.query)}\n`);

    // 1. Build Filter Object for StudentProfile
    let query = {};

    // Status Filter (Default to 'Active')
    query.studentStatus = status || 'Active';

    // Batch Filter
    if (batch) {
      query.batch = { $regex: batch, $options: 'i' };
    }

    // Shift Filter
    if (req.query.shift) {
      if (req.query.shift === 'Morning') {
        // Include 'Morning' AND documents where shift is not set (legacy data default)
        query.$or = [
          { shift: 'Morning' },
          { shift: { $exists: false } },
          { shift: null }
        ];
      } else {
        query.shift = req.query.shift;
      }
    }

    // Department Mapping
    if (department && department !== 'All Students') {
      const deptMap = {
        'CS': 'BSCS',
        'Computer Science': 'BSCS',
        'SE': 'BSSE',
        'Software Engineering': 'BSSE',
        'BBA': 'BBA',
        'Business Administration': 'BBA',
        'EE': 'BSEE',
        'Electrical Engineering': 'BSEE',
        'Math': 'BSMath',
        'Mathematics': 'BSMath',
        'IT': 'BSIT',
        'Information Technology': 'BSIT'
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
    const { batch, program, maxStudents, currentSemester, shift, force } = req.body;

    if (!batch || !program || !maxStudents || !currentSemester || !shift) {
      return res.status(400).json({ success: false, error: 'Please provide batch, program, maxStudents, currentSemester, and shift' });
    }

    // Normalize Shift Check
    const isMorning = shift.toLowerCase() === 'morning';

    // 1. Check for existing sections if not forced
    if (!force) {
      const existingSections = await StudentProfile.findOne({
        batch,
        program,
        currentSemester,
        shift: isMorning ? { $in: ['Morning', 'morning', null] } : shift, // Loose check
        section: { $ne: null } // Check if any section is assigned
      });

      if (existingSections) {
        return res.status(409).json({
          success: false,
          error: 'Sections already exist for this batch and shift. Do you want to overwrite?',
          requiresConfirmation: true
        });
      }
    }

    // 2. Fetch all students matching Batch, Program, Semester & Shift
    let query = { 
      batch: { $regex: batch, $options: 'i' },
      program: { $regex: `^${program}$`, $options: 'i' },
      currentSemester: parseInt(currentSemester)
    };
    
    if (isMorning) {
      // Handle legacy data: Morning OR missing/null shift
      query.$or = [
        { shift: { $regex: /^morning$/i } }, // Case insensitive Morning
        { shift: { $exists: false } },
        { shift: null }
      ];
    } else {
      query.shift = shift;
    }

    const students = await StudentProfile.find(query).sort({ admissionDate: 1 });

    if (students.length === 0) {
      return res.status(404).json({ success: false, error: 'No students found for this batch, program, semester, and shift' });
    }

    // 2.5. Scramble existing IDs
    const studentIds = students.map(s => s._id);
    const userIds = students.map(s => s.user).filter(id => id);

    await StudentProfile.updateMany(
      { _id: { $in: studentIds } },
      [{ $set: { studentId: { $concat: ["TEMP-", { $toString: "$_id" }] } } }]
    );

    if (userIds.length > 0) {
      await User.updateMany(
        { _id: { $in: userIds } },
        { $unset: { rollNumber: "" } }
      );
    }

    // 2.6. Re-fetch students
    const freshStudents = await StudentProfile.find(query).sort({ admissionDate: 1 });

    const totalStudents = freshStudents.length;
    const numSections = Math.ceil(totalStudents / maxStudents);
    const sections = [];
    
    const prefix = isMorning ? 'M' : 'E';
    
    for (let i = 1; i <= numSections; i++) {
      sections.push(`${prefix}${i}`);
    }

    let updatedCount = 0;
    
    const yearMatch = batch.match(/\d{4}/);
    const startYear = yearMatch ? parseInt(yearMatch[0]) : new Date().getFullYear();
    const startYearShort = startYear.toString().slice(-2);

    const sectionCounters = {};
    sections.forEach(sec => sectionCounters[sec] = 1);

    for (let i = 0; i < totalStudents; i++) {
      try {
        const sectionIndex = Math.floor(i / maxStudents);
        const sectionName = sections[sectionIndex];
        
        const sequence = sectionCounters[sectionName]++;
        const sequenceStr = sequence.toString().padStart(2, '0');
        
        const finalRollNo = `${program}-${sectionName}-${startYearShort}-${sequenceStr}`;

        const existingHolder = await StudentProfile.findOne({ studentId: finalRollNo });
        if (existingHolder) {
           if (existingHolder._id.toString() !== students[i]._id.toString()) {
              console.log(`Collision detected for ${finalRollNo}. Scrambling holder ${existingHolder._id}...`);
              existingHolder.studentId = `TEMP-${existingHolder._id}`;
              await existingHolder.save();
              if (existingHolder.user) {
                await User.findByIdAndUpdate(existingHolder.user, { $unset: { rollNumber: "" } });
              }
           }
        }

        const student = freshStudents[i];
        student.section = sectionName;
        student.studentId = finalRollNo;
        await student.save();

        if (student.user) {
           await User.findByIdAndUpdate(student.user, { rollNumber: finalRollNo });
        }

        updatedCount++;
      } catch (innerErr) {
        console.error(`Error processing student ${students[i]._id}:`, innerErr);
        throw innerErr;
      }
    }

    res.status(200).json({
      success: true,
      message: `${updatedCount} Students distributed into ${numSections} Sections (${sections.join(', ')}). Roll Numbers Generated (e.g., ${program}-${sections[0]}-${startYearShort}-01).`,
      data: {
        totalStudents,
        numSections,
        sections
      }
    });
  } catch (err) {
    console.error('Auto-Sectioning Error:', err);
    next(err);
  }
};

// @desc    Get Section Statistics
// @route   GET /api/v1/students/sections/stats
// @access  Private (Admin)
exports.getSectionStats = async (req, res, next) => {
  try {
    const rawStats = await StudentProfile.aggregate([
      {
        $match: {
          studentStatus: 'Active',
          section: { 
            $exists: true, 
            $ne: null, 
            $ne: "",
            $type: "string", // Ensure it is a string
            $regex: /\S/     // Must contain at least one non-whitespace character
          }
        }
      },
      // Normalize Shift for Grouping (Case Insensitive + Trim)
      {
        $addFields: {
          shiftNormalized: {
            $toLower: { 
              $trim: { 
                input: { $ifNull: ["$shift", "Morning"] } 
              } 
            }
          }
        }
      },
      // Add Sort Order for Shift (Morning=1, Evening=2)
      {
        $addFields: {
          shiftOrder: {
            $cond: [
              { $eq: ["$shiftNormalized", "morning"] },
              1,
              2
            ]
          }
        }
      },
      {
        $group: {
          _id: {
            program: '$program',
            batch: '$batch',
            semester: '$currentSemester',
            section: '$section',
            shift: '$shiftNormalized',
            shiftOrder: '$shiftOrder'
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: {
          '_id.program': 1,
          '_id.semester': 1,
          '_id.shiftOrder': 1, // Sort by Shift Order (Morning first)
          '_id.section': 1
        }
      }
    ]);

    // Post-process to Title Case for display consistency
    const stats = rawStats.map(item => {
      const rawShift = item._id.shift || 'morning';
      const displayShift = rawShift.charAt(0).toUpperCase() + rawShift.slice(1);
      return {
        ...item,
        _id: {
          ...item._id,
          shift: displayShift
        }
      };
    });

    console.log("Section Stats Result:", JSON.stringify(stats, null, 2));

    // DEBUG: Check for Unassigned Students
    const unassigned = await StudentProfile.aggregate([
      { $match: { studentStatus: 'Active', section: null } },
      { $group: { _id: { program: '$program', shift: '$shift' }, count: { $sum: 1 } } }
    ]);
    if (unassigned.length > 0) {
      console.log("WARNING: Unassigned Active Students found:", JSON.stringify(unassigned, null, 2));
    }

    res.status(200).json({
      success: true,
      count: stats.length,
      data: stats
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a Section (Set to NULL)
// @route   POST /api/v1/students/sections/delete
// @access  Private (Admin)
exports.deleteSection = async (req, res, next) => {
  try {
    let { batch, program, semester, section, shift } = req.body;

    if (!batch || !program || !semester || !section) {
      return res.status(400).json({ success: false, error: 'Please provide batch, program, semester, and section' });
    }

    const query = { 
      batch: batch,
      program: program,
      currentSemester: parseInt(semester), 
      section: section
    };

    if (shift) {
       query.shift = shift;
    }

    // Find students to process
    const students = await StudentProfile.find(query);
    let updatedCount = 0;

    for (const student of students) {
      const tempId = `TEMP-${student._id}`;
      
      // Update Profile
      student.section = null;
      student.studentId = tempId;
      await student.save();

      // Update User
      if (student.user) {
        await User.findByIdAndUpdate(student.user, { rollNumber: tempId });
      }
      updatedCount++;
    }

    res.status(200).json({
      success: true,
      message: `Section deleted. ${updatedCount} students marked as Unassigned with Temp IDs.`,
      data: { count: updatedCount }
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
    const { batch, program, semester, sourceSection, targetSection, shift } = req.body;

    if (!batch || !program || !semester || !sourceSection || !targetSection) {
      return res.status(400).json({ success: false, error: 'Please provide all required fields' });
    }

    const commonQuery = {
      batch,
      program,
      currentSemester: parseInt(semester),
    };
    if (shift) commonQuery.shift = shift;

    // 1. Find Max Sequence in Target Section
    const targetStudents = await StudentProfile.find({
      ...commonQuery,
      section: targetSection
    });

    let maxSequence = 0;
    targetStudents.forEach(s => {
      // Assuming format: PROG-SEC-YR-SEQ (e.g., BSCS-M3-25-30)
      if (s.studentId) {
        const parts = s.studentId.split('-');
        const seq = parseInt(parts[parts.length - 1]);
        if (!isNaN(seq) && seq > maxSequence) {
          maxSequence = seq;
        }
      }
    });

    // 2. Find Source Students
    const sourceStudents = await StudentProfile.find({
      ...commonQuery,
      section: sourceSection
    }).sort({ studentId: 1 }); // Maintain order

    if (sourceStudents.length === 0) {
      return res.status(404).json({ success: false, error: 'No students found in source section' });
    }

    // 3. Prepare Roll Number Components
    // Extract Batch Short (e.g., "Fall 2025" -> "25")
    const yearMatch = batch.match(/\d{4}/);
    const startYear = yearMatch ? parseInt(yearMatch[0]) : new Date().getFullYear();
    const startYearShort = startYear.toString().slice(-2);

    let updatedCount = 0;

    // 4. Update Each Student
    for (const student of sourceStudents) {
      maxSequence++;
      const sequenceStr = maxSequence.toString().padStart(2, '0');
      const newRollNo = `${program}-${targetSection}-${startYearShort}-${sequenceStr}`;

      // Check for collision (Safety)
      const existingHolder = await StudentProfile.findOne({ studentId: newRollNo });
      if (existingHolder && existingHolder._id.toString() !== student._id.toString()) {
         // Scramble holder
         existingHolder.studentId = `TEMP-${existingHolder._id}`;
         await existingHolder.save();
         if (existingHolder.user) {
            await User.findByIdAndUpdate(existingHolder.user, { $unset: { rollNumber: "" } });
         }
      }

      student.section = targetSection;
      student.studentId = newRollNo;
      await student.save();

      if (student.user) {
        await User.findByIdAndUpdate(student.user, { rollNumber: newRollNo });
      }
      updatedCount++;
    }

    res.status(200).json({
      success: true,
      message: `Merged ${sourceSection} into ${targetSection}. ${updatedCount} students moved and re-sequenced (starting from ${maxSequence - updatedCount + 1}).`
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

// @desc    Get Student Filters (Batches & Programs)
// @route   GET /api/v1/students/filters
// @access  Private (Admin)
exports.getStudentFilters = async (req, res, next) => {
  try {
    const { batch, shift, semester, section } = req.query;
    const Department = require('../models/Department'); // Import Department model

    const batches = await StudentProfile.distinct('batch');
    // Fetch programs from Department model to ensure only active departments are shown
    const departments = await Department.find({}).select('programCode').sort({ programCode: 1 });
    const programs = departments.map(d => d.programCode);
    
    const sections = await StudentProfile.distinct('section');
    const semesters = await StudentProfile.distinct('currentSemester', { studentStatus: 'Active' });

    // Build Match Stage for Counts
    let matchStage = { studentStatus: 'Active' };

    if (batch) {
      matchStage.batch = batch;
    }

    if (semester) {
      matchStage.currentSemester = parseInt(semester);
    }

    if (section) {
      matchStage.section = section;
    }

    if (shift) {
      if (shift === 'Morning') {
        matchStage.$or = [
          { shift: 'Morning' },
          { shift: { $exists: false } },
          { shift: null }
        ];
      } else {
        matchStage.shift = shift;
      }
    }

    // Aggregation to get counts per program for Active students (Filtered)
    const programCounts = await StudentProfile.aggregate([
      { $match: matchStage },
      { $group: { _id: '$program', count: { $sum: 1 } } }
    ]);

    // Calculate total active students (Filtered)
    const totalActive = programCounts.reduce((acc, curr) => acc + curr.count, 0);

    // Convert array to object for easier lookup
    const counts = programCounts.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        batches: batches.filter(b => b).sort().reverse(), // Filter nulls
        programs: programs, // Use Department programs
        sections: sections.filter(s => s).sort(), // Filter nulls
        semesters: semesters.sort((a, b) => a - b), // Sort numerically
        counts: {
          total: totalActive,
          ...counts
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Nuke BBA Data (Temporary Fix)
// @route   GET /api/v1/students/nuke-bba
// @access  Public
exports.deleteBBA = async (req, res, next) => {
  try {
    const result = await StudentProfile.deleteMany({ program: { $regex: /BBA/i } });
    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} BBA students.`,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get logged-in student's enrolled courses (based on section)
// @route   GET /api/v1/students/my-courses
// @access  Private (Student)
exports.getMyCourses = async (req, res, next) => {
  try {
    // 1. Get Student Profile
    const student = await StudentProfile.findOne({ user: req.user.id });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    // 2. Find Allocations matching Student's Batch, Program, Semester, Section
    const allocations = await CourseAllocation.find({
      program: student.program,
      batch: student.batch,
      semester: student.currentSemester,
      section: student.section
    })
    .populate('course', 'title code credits')
    .populate('teacher', 'name uniEmail')
    .sort({ 'course.code': 1 });

    res.status(200).json({
      success: true,
      count: allocations.length,
      data: allocations
    });
  } catch (err) {
    next(err);
  }
};
