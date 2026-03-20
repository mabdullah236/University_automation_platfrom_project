const mongoose = require('mongoose');
const StudentProfile = require('./src/models/StudentProfile');
const fs = require('fs');

const log = (msg) => {
  console.log(msg);
  fs.appendFileSync('debug_log.txt', msg + '\n');
};

log('STARTING DEBUG SCRIPT...');

const run = async () => {
  try {
    log('Connecting to DB...');
    await mongoose.connect('mongodb://127.0.0.1:27017/uvap_local');
    log('Connected to DB');

    // 1. Find ALL students
    const allStudents = await StudentProfile.find({});
    log(`Total Students in DB: ${allStudents.length}`);

    // 2. Filter manually
    const targets = allStudents.filter(s => 
      s.program === 'BSCS' && 
      s.currentSemester === 1 && 
      s.section === 'A'
    );

    log(`Found ${targets.length} potential targets in JS filter.`);
    
    if (targets.length > 0) {
      log('--- TARGET DETAILS ---');
      targets.forEach(t => {
        log(`ID: ${t._id}`);
        log(`Batch: "${t.batch}"`);
        log(`Program: "${t.program}"`);
        log(`Section: "${t.section}"`);
        log(`Semester: ${t.currentSemester}`);
        log('----------------------');
      });

      // 3. Attempt Update using ID
      const ids = targets.map(t => t._id);
      const result = await StudentProfile.updateMany(
        { _id: { $in: ids } },
        { $set: { section: 'Unassigned' } }
      );
      log(`Updated ${result.modifiedCount} students via ID match.`);
    } else {
      log('No students found matching BSCS, Sem 1, Section A in JS filter.');
      if (allStudents.length > 0) {
         log('--- SAMPLE STUDENT ---');
         log(JSON.stringify(allStudents[0], null, 2));
      }
    }

    process.exit(0);
  } catch (err) {
    log('ERROR: ' + err);
    process.exit(1);
  }
};

run();
