console.log('Script process started...');
const mongoose = require('mongoose');
const User = require('./src/models/User');
const FacultyProfile = require('./src/models/FacultyProfile');
const CourseAllocation = require('./src/models/CourseAllocation');
const Course = require('./src/models/Course');
const Notification = require('./src/models/Notification');
const fs = require('fs');

const MONGO_URI = 'mongodb://127.0.0.1:27017/uvap_local';

const log = (msg) => {
  console.log(msg);
  fs.appendFileSync('verify_auto_assign_output.txt', msg + '\n');
};

const run = async () => {
  try {
    fs.writeFileSync('verify_auto_assign_output.txt', 'Starting Auto-Assign Verification...\n');
    await mongoose.connect(MONGO_URI);
    log('Connected to DB');

    // 1. Create a Dummy Course
    const course = await Course.create({
      title: 'Advanced Artificial Intelligence',
      code: 'AI-999',
      credits: 3,
      department: 'Computer Science',
      semester: 8,
      program: 'BSCS'
    });
    log(`Created Course: ${course.title}`);

    // 2. Create an Unassigned Allocation
    const allocation = await CourseAllocation.create({
      course: course._id,
      section: 'A',
      day: 'Monday',
      time: '10:00-11:30',
      room: 'C-201',
      batch: 'Fall 2025',
      teacher: null // Unassigned
    });
    log(`Created Unassigned Allocation for ${course.title}`);

    // 3. Create a New Faculty (Matching Dept & Spec)
    // We'll use the API logic simulation here since we can't easily call the controller directly without mocking req/res
    // But we can call the service function directly!
    const allocationService = require('./src/services/allocationService');

    const user = await User.create({
      name: 'Dr. AI Expert',
      email: `ai.expert.${Date.now()}@test.com`,
      password: 'password123',
      role: 'faculty'
    });

    const profile = await FacultyProfile.create({
      user: user._id,
      employeeId: `TEST-${Date.now()}`,
      department: 'Computer Science',
      specialization: 'Artificial Intelligence',
      designation: 'Professor',
      joiningDate: new Date(),
      qualifications: [{ degree: 'PhD', institution: 'MIT', year: 2020 }]
    });
    log(`Created New Faculty: ${user.name} (Dept: ${profile.department}, Spec: ${profile.specialization})`);

    // 4. Trigger Auto-Assignment
    log('Triggering Auto-Assignment...');
    const assigned = await allocationService.assignUnassignedCoursesToTeacher(profile, 'Fall 2025');

    // 5. Verify
    if (assigned.length > 0) {
      log(`SUCCESS: Assigned ${assigned.length} courses to ${user.name}`);
      assigned.forEach(a => log(` - ${a.course.title}`));
    } else {
      log('FAILURE: No courses assigned.');
    }

    // 6. Cleanup
    await CourseAllocation.findByIdAndDelete(allocation._id);
    await Course.findByIdAndDelete(course._id);
    await FacultyProfile.findByIdAndDelete(profile._id);
    await User.findByIdAndDelete(user._id);
    log('Cleanup Complete.');

  } catch (err) {
    log('ERROR: ' + err.message);
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
};

run();
