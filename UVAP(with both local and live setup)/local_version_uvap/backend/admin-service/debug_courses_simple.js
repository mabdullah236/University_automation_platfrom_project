const mongoose = require('mongoose');
const Course = require('./src/models/Course');

const MONGO_URI = 'mongodb://127.0.0.1:27017/uvap_local';

const fs = require('fs');

const log = (msg) => {
  console.log(msg);
  fs.appendFileSync('debug_output.txt', msg + '\n');
};

const debugCourses = async () => {
  log('Starting debug script...');
  try {
    log('Connecting to DB...');
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    log('Connected to DB');

    const courses = await Course.find({ program: 'BSCS', semester: 1 });
    log(`Found ${courses.length} courses for BSCS Semester 1:`);
    courses.forEach(c => {
      log(`- ${c.title} (${c.code}) [${c._id}]`);
    });

  } catch (err) {
    log('Error: ' + err);
  } finally {
    log('Disconnecting...');
    await mongoose.disconnect();
    log('Disconnected');
  }
};

debugCourses();
