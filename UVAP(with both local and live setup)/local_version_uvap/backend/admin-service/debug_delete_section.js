const mongoose = require('mongoose');
const StudentProfile = require('./src/models/StudentProfile');
const fs = require('fs');

const log = (msg) => {
  console.log(msg);
  fs.appendFileSync('debug_delete_log.txt', msg + '\n');
};

const run = async () => {
  try {
    log('Connecting to DB...');
    await mongoose.connect('mongodb://127.0.0.1:27017/uvap_local');
    log('Connected to DB');

    const students = await StudentProfile.find({
      program: { $regex: 'BSCS', $options: 'i' },
      currentSemester: 1,
      section: { $regex: 'A', $options: 'i' }
    });

    log(`Found ${students.length} students in Section A.`);

    if (students.length > 0) {
      log('--- SAMPLE STUDENT DATA ---');
      const s = students[0];
      log(`ID: ${s._id}`);
      log(`Program: '${s.program}'`);
      log(`Batch: '${s.batch}'`);
      log(`Semester: ${s.currentSemester}`);
      log(`Section: '${s.section}'`);
      log(`Shift: '${s.shift}'`);
      log('---------------------------');
    } else {
        log('No students found matching the query.');
    }

    process.exit(0);
  } catch (err) {
    log('ERROR: ' + err);
    process.exit(1);
  }
};

run();
