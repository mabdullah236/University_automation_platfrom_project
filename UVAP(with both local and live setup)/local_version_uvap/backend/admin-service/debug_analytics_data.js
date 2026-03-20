const mongoose = require('mongoose');
const StudentProfile = require('./src/models/StudentProfile');
const fs = require('fs');

const log = (msg) => {
  console.log(msg);
  fs.appendFileSync('debug_analytics_log.txt', msg + '\n');
};

const run = async () => {
  try {
    log('Connecting to DB...');
    await mongoose.connect('mongodb://127.0.0.1:27017/uvap_local');
    log('Connected to DB');

    // Find students in BSCS Fall 2025 Evening (from screenshot)
    const students = await StudentProfile.find({
      program: 'BSCS',
      batch: 'Fall 2025',
      shift: 'Evening'
    });

    log(`Found ${students.length} students in BSCS Fall 2025 Evening.`);

    students.forEach(s => {
      log(`ID: ${s._id}, Section: '${s.section}' (Type: ${typeof s.section}), Status: ${s.studentStatus}`);
    });

    process.exit(0);
  } catch (err) {
    log('ERROR: ' + err);
    process.exit(1);
  }
};

run();
