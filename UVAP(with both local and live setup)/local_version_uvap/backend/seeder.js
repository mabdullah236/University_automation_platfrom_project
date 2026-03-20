const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const User = require('./src/models/User');
const Course = require('./src/models/Course');
const StudentProfile = require('./src/models/StudentProfile');
const FacultyProfile = require('./src/models/FacultyProfile');
const AdminProfile = require('./src/models/AdminProfile');
const Admission = require('./src/models/Admission');
const bcrypt = require('bcryptjs');

dotenv.config();
connectDB();

const importData = async () => {
  try {
    console.log('Starting Data Import...');
    // Clear existing data
    await User.deleteMany();
    await Course.deleteMany();
    await StudentProfile.deleteMany();
    await FacultyProfile.deleteMany();
    await AdminProfile.deleteMany();
    await Admission.deleteMany();

    console.log('Data Destroyed...');

    // const salt = await bcrypt.genSalt(10);
    // const hashedPassword = await bcrypt.hash('1234', salt);
    // Let the User model handle hashing via pre-save hook
    const password = '123456';

    // 1. Create Admin
    const adminUser = await User.create({
      name: 'Super Admin',
      uniEmail: 'admin@uvap.com',
      personalEmail: 'admin.personal@gmail.com',
      password: password,
      role: 'admin',
      phone: '03001234567',
      isVerified: true,
    });

    await AdminProfile.create({
      user: adminUser._id,
      cnic: '35202-1234567-0',
      phone: '03001234567',
      address: 'Admin House, University Campus',
      status: 'Active'
    });

    // 2. Create 5 Faculty Members
    const facultyUsers = [];
    const departments = ['CS', 'SE', 'BBA', 'EE', 'Math'];
    
    for (let i = 0; i < 5; i++) {
      const user = await User.create({
        name: `Faculty Member ${i + 1}`,
        uniEmail: `faculty${i + 1}@uvap.com`,
        personalEmail: `faculty${i + 1}.personal@gmail.com`,
        password: password,
        role: 'faculty',
        phone: `0300123456${i}`,
        isVerified: true,
      });
      facultyUsers.push(user);

      await FacultyProfile.create({
        user: user._id,
        employeeId: `EMP-${100 + i}`,
        cnic: `35202-1234567-${100 + i}`,
        department: departments[i],
        designation: 'Assistant Professor',
        salary: 150000 + (i * 10000),
        specialization: 'General',
        joiningDate: new Date('2020-01-01'),
        qualifications: [{ degree: 'PhD', institution: 'LUMS', year: 2018 }]
      });
    }

    // 3. Create Courses (Assign to Faculty)
    const courses = [];
    const courseTitles = ['Intro to Computing', 'Software Engineering', 'Business 101', 'Circuit Analysis', 'Calculus I'];
    
    for (let i = 0; i < 5; i++) {
      const course = await Course.create({
        code: `CS-${101 + i}`,
        title: courseTitles[i],
        credits: 3,
        department: departments[i],
        semester: 1,
        program: 'BSCS',
        instructor: facultyUsers[i]._id,
      });
      courses.push(course);
    }

    // 4. Create 20 Students
    const studentUsers = [];
    for (let i = 0; i < 20; i++) {
      const user = await User.create({
        name: `Student ${i + 1}`,
        uniEmail: `student${i + 1}@uvap.com`,
        personalEmail: `student${i + 1}.personal@gmail.com`,
        password: password,
        role: 'student',
        phone: `0300987654${i}`,
        rollNumber: `2023-CS-${String(i + 1).padStart(3, '0')}`, // Generate Roll No: 2023-CS-001
        isVerified: true,
      });
      studentUsers.push(user);

      await StudentProfile.create({
        user: user._id,
        studentId: `ST-${202300 + i}`,
        cnic: `35202-1234567-${i}`,
        program: 'BSCS',
        batch: '2023',
        currentSemester: 1,
        promotionStatus: 'Promoted',
        dob: new Date('2002-01-01'),
        address: 'Lahore, Pakistan',
        guardianName: `Guardian ${i + 1}`,
        guardianPhone: `0300112233${i}`,
        guardianOccupation: 'Business',
        admissionDate: new Date('2023-09-01'),
      });

      // Create dummy admission record for stats
      if (i < 5) { // Create 5 pending admissions
         await Admission.create({
            fullName: `Applicant ${i}`,
            cnic: `35202-0000000-${i}`,
            dateOfBirth: new Date('2005-01-01'),
            email: `applicant${i}@test.com`,
            phone: '03000000000',
            address: 'Lahore',
            guardianName: 'Father',
            guardianContact: '03000000000',
            matric: { marks: 900, board: 'BISE', year: 2020 },
            inter: { marks: 900, board: 'BISE', year: 2022 },
            programApplied: 'BSCS',
            status: 'Pending',
            religion: 'Islam',
            guardianOccupation: 'Business',
            documents: {
              cnicFront: '/uploads/dummy-cnic-front.jpg',
              cnicBack: '/uploads/dummy-cnic-back.jpg',
              matricTranscript: '/uploads/dummy-matric.jpg',
              interTranscript: '/uploads/dummy-inter.jpg'
            }
         });
      }
    }

    console.log('Data Imported Successfully!');
    console.log('Admin: admin@uvap.com / 123456');
    console.log('Faculty: faculty1@uvap.com / 123456');
    console.log('Student: student1@uvap.com / 123456');
    
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  // destroyData();
} else {
  importData();
}
