const mongoose = require('mongoose');
const fs = require('fs');
const User = require('./src/models/User');
const FacultyProfile = require('./src/models/FacultyProfile');
const Course = require('./src/models/Course');
const CourseAllocation = require('./src/models/CourseAllocation');
const allocationService = require('./src/services/allocationService');

const MONGO_URI = 'mongodb://127.0.0.1:27017/uvap_local';

const log = (msg) => {
  console.log(msg);
  fs.appendFileSync('verify_output.txt', msg + '\n');
};

const run = async () => {
  try {
    fs.writeFileSync('verify_output.txt', 'Starting...\n');
    log('Connecting to DB...');
    await mongoose.connect(MONGO_URI);
    log('Connected to DB');

    // 1. Cleanup
    log('Cleaning up...');
    await User.deleteMany({ email: { $in: ['teacherA@test.com', 'teacherB@test.com'] } });
    await FacultyProfile.deleteMany({ employeeId: { $in: ['TEST001', 'TEST002'] } });
    await Course.deleteMany({ code: 'TEST101' });
    await CourseAllocation.deleteMany({ section: 'TEST_SEC' });
    log('Cleanup done');

    // 2. Create Teachers
    const userA = await User.create({ name: 'Teacher A', email: 'teacherA@test.com', password: '123', role: 'faculty' });
    const profileA = await FacultyProfile.create({ user: userA._id, employeeId: 'TEST001', department: 'Math', specialization: 'Calculus', status: 'Active' });

    const userB = await User.create({ name: 'Teacher B', email: 'teacherB@test.com', password: '123', role: 'faculty' });
    const profileB = await FacultyProfile.create({ user: userB._id, employeeId: 'TEST002', department: 'Math', specialization: 'Calculus', status: 'Active' });

    // 3. Create Course
    const course = await Course.create({ title: 'Calculus I', code: 'TEST101', department: 'Math', credits: 3 });

    // 4. Assign to Teacher A
    const allocation = await CourseAllocation.create({
      course: course._id,
      teacher: userA._id,
      section: 'TEST_SEC',
      semester: 1,
      program: 'BSCS',
      batch: 'Fall 2025'
    });

    log(`Initial Allocation: ${allocation.course} assigned to ${userA.name}`);

    // 5. Simulate Deletion of Teacher A -> Reassignment
    log('Simulating deletion of Teacher A...');
    
    // Logic from facultyController.deleteFaculty
    const bestTeacher = await allocationService.findBestTeacher(
        course, 
        'Fall 2025', 
        userA._id.toString() // Exclude A
    );

    if (bestTeacher) {
        log(`Best replacement found: ${bestTeacher.user.name}`);
        allocation.teacher = bestTeacher.user._id;
        await allocation.save();
    } else {
        log('No replacement found.');
        allocation.teacher = null;
        await allocation.save();
    }

    // 6. Verify
    const updatedAllocation = await CourseAllocation.findById(allocation._id).populate('teacher');
    if (updatedAllocation.teacher && updatedAllocation.teacher.email === 'teacherB@test.com') {
        log('SUCCESS: Course reassigned to Teacher B');
    } else {
        log('FAILURE: Course not reassigned correctly ' + (updatedAllocation.teacher ? updatedAllocation.teacher.email : 'null'));
    }

  } catch (err) {
    log('ERROR: ' + err.message);
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
};

run();
