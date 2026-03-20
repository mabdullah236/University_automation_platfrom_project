const fs = require('fs');
const mongoose = require('mongoose');
const Course = require('./src/models/Course');
const CourseAllocation = require('./src/models/CourseAllocation');

const MONGO_URI = 'mongodb://localhost:27017/uvap_local';

const log = (msg) => {
    console.log(msg);
    fs.appendFileSync('debug_output.txt', msg + '\n');
};

const checkICT = async () => {
  try {
    fs.writeFileSync('debug_output.txt', 'Starting Debug...\n');
    await mongoose.connect(MONGO_URI);
    log('Connected to DB');

    const courses = await Course.find().limit(50);
    log('--- First 50 Courses ---');
    courses.forEach(c => {
        log(`Title: ${c.title}, Code: ${c.code}, Credits: ${c.credits}`);
    });

    const allocations = await CourseAllocation.find().populate('course');
    const ictAllocations = allocations.filter(a => a.course && a.course.title.match(/ICT/i));
    
    log('\n--- Allocations Found ---');
    ictAllocations.forEach(a => {
        log(`Course: ${a.course.title}, Section: ${a.section}, Program: ${a.program}, Semester: ${a.semester}`);
    });

  } catch (err) {
    log('Error: ' + err.message);
  } finally {
    await mongoose.disconnect();
  }
};

checkICT();
