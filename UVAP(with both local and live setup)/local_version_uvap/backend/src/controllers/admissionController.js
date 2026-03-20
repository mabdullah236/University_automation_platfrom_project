const Admission = require('../models/Admission');
const SystemConfig = require('../models/SystemConfig');

// @desc    Submit admission application
// @route   POST /api/v1/admissions
// @access  Public
exports.submitApplication = async (req, res, next) => {
  try {
    // Check if admissions are open
    const config = await SystemConfig.findOne();
    if (config && !config.admissionsOpen) {
      return res.status(403).json({ success: false, message: 'Admissions are currently closed.' });
    }

    // Check for existing application by CNIC
    let existingAdmission = await Admission.findOne({ cnic: req.body.cnic });

    if (existingAdmission) {
      if (existingAdmission.status === 'Pending' || existingAdmission.status === 'Approved') {
        return res.status(400).json({ success: false, message: 'An application with this CNIC already exists.' });
      }
      // If Deleted or Rejected, allow re-submission (Update existing)
    }

    // --- GLOBAL CONFLICT CHECK (CRUCIAL) ---
    const User = require('../models/User');
    const StudentProfile = require('../models/StudentProfile');
    const FacultyProfile = require('../models/FacultyProfile');

    // 1. Check User Collection (Phone & Email)
    const conflictingUser = await User.findOne({
        $or: [
            { phone: req.body.phone },
            { personalEmail: req.body.email }
        ]
    });

    if (conflictingUser) {
        let field = conflictingUser.phone === req.body.phone ? 'Phone Number' : 'Personal Email';
        let role = conflictingUser.role.charAt(0).toUpperCase() + conflictingUser.role.slice(1);
        return res.status(400).json({ success: false, message: `Cannot Re-Submit: This ${field} is already used by a ${role}.` });
    }

    // 2. Check Profiles (CNIC)
    const conflictingStudent = await StudentProfile.findOne({ cnic: req.body.cnic });
    if (conflictingStudent) {
         return res.status(400).json({ success: false, message: `Cannot Re-Submit: This CNIC is already registered by a Student.` });
    }

    const conflictingFaculty = await FacultyProfile.findOne({ cnic: req.body.cnic });
    if (conflictingFaculty) {
         return res.status(400).json({ success: false, message: `Cannot Re-Submit: This CNIC is already registered by a Faculty Member.` });
    }
    // ---------------------------------------

    // Extract file paths from req.files
    const documents = {
      cnicFront: req.files?.['cnicFront']?.[0]?.path || null,
      cnicBack: req.files?.['cnicBack']?.[0]?.path || null,
      matricTranscript: req.files?.['matricTranscript']?.[0]?.path || null,
      interTranscript: req.files?.['interTranscript']?.[0]?.path || null
    };

    // Construct Application Data
    const applicationData = {
      fullName: req.body.fullName,
      cnic: req.body.cnic,
      dateOfBirth: req.body.dateOfBirth,
      bloodGroup: req.body.bloodGroup,
      religion: req.body.religion,
      nationality: req.body.nationality,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
      guardianName: req.body.guardianName,
      guardianOccupation: req.body.guardianOccupation,
      guardianIncome: req.body.guardianIncome,
      guardianContact: req.body.guardianContact,
      programApplied: req.body.programApplied,
      semester: req.body.semester || 1,
      documents,
      matric: {
        marks: req.body.matricMarks,
        board: req.body.matricBoard,
        year: req.body.matricYear,
        school: req.body.matricSchool
      },
      inter: {
        marks: req.body.interMarks,
        board: req.body.interBoard,
        year: req.body.interYear,
        college: req.body.interCollege
      },
      status: 'Pending', // Reset status to Pending
      applicationDate: Date.now() // Update date
    };

    let admission;
    if (existingAdmission) {
      // Update existing
      admission = await Admission.findByIdAndUpdate(existingAdmission._id, applicationData, { new: true });
      return res.status(200).json({
        success: true,
        data: admission,
        message: 'Application Re-submitted Successfully'
      });
    } else {
      // Create new
      admission = await Admission.create(applicationData);
      return res.status(201).json({
        success: true,
        data: admission,
        message: 'Application submitted successfully'
      });
    }

  } catch (err) {
    console.error('Admission Submission Error:', err);
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'An application with this CNIC already exists.' });
    }
    next(err);
  }
};

// @desc    Get all applications
// @route   GET /api/v1/admissions
// @access  Private (Admin)
exports.getApplications = async (req, res, next) => {
  try {
    const admissions = await Admission.find().sort({ applicationDate: -1 });
    res.status(200).json({ success: true, count: admissions.length, data: admissions });
  } catch (err) {
    next(err);
  }
};

// @desc    Update application status
// @route   PUT /api/v1/admissions/:id
// @access  Private (Admin)
// @desc    Update application status
// @route   PUT /api/v1/admissions/:id
// @access  Private (Admin)
// @desc    Update application status
// @route   PUT /api/v1/admissions/:id
// @access  Private (Admin)
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    let admission = await Admission.findById(req.params.id);

    if (!admission) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // If Approved, create a User account for the student
    if (status === 'Approved' && admission.status !== 'Approved') {
      // FEE CHECK (Placeholder - assume Paid if Admin approves)
      // if (admission.feeStatus !== 'Paid') return res.status(400).json(...)

      const User = require('../models/User');
      const StudentProfile = require('../models/StudentProfile');
      const sendEmail = require('../utils/emailService');
      const crypto = require('crypto');

      // 1. Duplicate Checks
      const existingUser = await User.findOne({ 
        $or: [{ phone: admission.phone }, { personalEmail: admission.email }] 
      });

      if (existingUser) {
        let field = existingUser.phone === admission.phone ? 'Phone Number' : 'Personal Email';
        let role = existingUser.role.charAt(0).toUpperCase() + existingUser.role.slice(1);
        return res.status(400).json({ success: false, message: `This ${field} is already registered by a ${role}.` });
      }

      const existingStudentProfile = await StudentProfile.findOne({ cnic: admission.cnic });
      if (existingStudentProfile) {
        return res.status(400).json({ success: false, message: 'This CNIC is already registered by a Student.' });
      }

      const existingFacultyProfile = await require('../models/FacultyProfile').findOne({ cnic: admission.cnic });
      if (existingFacultyProfile) {
        return res.status(400).json({ success: false, message: 'This CNIC is already registered by a Faculty Member.' });
      }

      // 2. Generate Official Email
      const names = admission.fullName.trim().toLowerCase().split(/\s+/);
      const lastName = names.length > 1 ? names[names.length - 1] : names[0];
      const firstInitial = names[0][0];
      
      let baseEmail = `${firstInitial}.${lastName}@uvap.com`;
      let uniEmail = baseEmail;
      let counter = 1;

      while (await User.findOne({ uniEmail })) {
        uniEmail = `${firstInitial}.${lastName}${counter}@uvap.com`;
        counter++;
      }

      // 3. Temporary Roll No & No Section
      // Format: REG-{timestamp}
      const tempRollNo = `REG-${Date.now()}`;
      const password = crypto.randomBytes(4).toString('hex');

      // 4. Atomic Creation
      let user = null;
      let profile = null;

      try {
        user = await User.create({
          name: admission.fullName,
          uniEmail: uniEmail,
          personalEmail: admission.email,
          password: password,
          role: 'student',
          phone: admission.phone,
          rollNumber: tempRollNo,
          isVerified: true,
          isFirstLogin: true
        });

        profile = await StudentProfile.create({
          user: user._id,
          studentId: tempRollNo,
          program: admission.programApplied,
          batch: 'Fall 2025', // Should ideally come from config
          section: null, // No section assigned yet
          guardianName: admission.guardianName,
          guardianPhone: admission.guardianContact,
          guardianOccupation: admission.guardianOccupation,
          address: admission.address,
          dob: admission.dateOfBirth,
          cnic: admission.cnic,
          admissionDate: Date.now()
        });

        const message = `
          <p>Congratulations! Your admission to UVAP has been approved.</p>
          <p><strong>Your Temporary Student Credentials:</strong></p>
          <p>Registration ID: <strong>${tempRollNo}</strong></p>
          <p>Login ID: <strong>${uniEmail}</strong></p>
          <p>Password: <strong>${password}</strong></p>
          <p>Please login. You will be assigned a Section and Official Roll Number later.</p>
          <p><a href="http://localhost:5173/login">Login to Portal</a></p>
        `;

        await sendEmail({
          email: admission.email,
          subject: 'Admission Approved - UVAP',
          message: message,
          name: admission.fullName
        });

      } catch (error) {
        console.error("Approval Failed (Rollback):", error);
        if (user) await User.findByIdAndDelete(user._id);
        if (profile) await StudentProfile.findOneAndDelete({ user: user._id });
        
        return res.status(500).json({ 
          success: false, 
          message: "Approval failed due to system error. No account created." 
        });
      }
    }

    admission.status = status;
    await admission.save();

    res.status(200).json({ success: true, data: admission });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete admission application
// @route   DELETE /api/v1/admissions/:id
// @access  Private (Admin)
exports.deleteAdmission = async (req, res, next) => {
  try {
    const admission = await Admission.findById(req.params.id);

    if (!admission) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    await admission.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};
