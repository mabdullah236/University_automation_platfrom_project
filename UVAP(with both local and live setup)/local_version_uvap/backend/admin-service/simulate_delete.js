const mongoose = require('mongoose');
const StudentProfile = require('./src/models/StudentProfile');
const fs = require('fs');

const log = (msg) => {
  console.log(msg);
  fs.appendFileSync('simulation_log.txt', msg + '\n');
};

const run = async () => {
  try {
    log('Connecting to DB...');
    await mongoose.connect('mongodb://127.0.0.1:27017/uvap_local');
    log('Connected to DB');

    // Inputs (Simulating req.body)
    const batch = 'Fall 2025';
    const program = 'BSCS';
    const semester = '1';
    const section = 'A';
    const shift = 'Morning';

    log('--- SIMULATION INPUTS ---');
    log(JSON.stringify({ batch, program, semester, section, shift }));

    const sem = parseInt(semester);

    // Logic from Controller
    const query = { 
      batch: { $regex: batch, $options: 'i' },
      program: { $regex: program, $options: 'i' },
      currentSemester: sem, 
      section 
    };

    if (shift) {
      if (shift === 'Morning') {
        query.$or = [
          { shift: 'Morning' },
          { shift: { $exists: false } },
          { shift: null }
        ];
      } else {
        query.shift = shift;
      }
    }

    log('--- CONSTRUCTED QUERY ---');
    log(JSON.stringify(query, null, 2));

    // 1. Count
    const count = await StudentProfile.countDocuments(query);
    log(`Matched Documents: ${count}`);

    // 2. If 0, try to find WHY.
    if (count === 0) {
        log('--- DEBUGGING MISMATCH ---');
        // Try finding without Shift
        const queryNoShift = { ...query };
        delete queryNoShift.$or;
        delete queryNoShift.shift;
        const countNoShift = await StudentProfile.countDocuments(queryNoShift);
        log(`Count without Shift filter: ${countNoShift}`);

        if (countNoShift > 0) {
            const sample = await StudentProfile.findOne(queryNoShift);
            log('Sample Student (No Shift Filter):');
            log(`Shift Value: '${sample.shift}' (Type: ${typeof sample.shift})`);
        } else {
             // Try finding without Section
            const queryNoSection = { ...queryNoShift };
            delete queryNoSection.section;
            const countNoSection = await StudentProfile.countDocuments(queryNoSection);
            log(`Count without Section filter: ${countNoSection}`);
             if (countNoSection > 0) {
                const sample = await StudentProfile.findOne(queryNoSection);
                log('Sample Student (No Section Filter):');
                log(`Section Value: '${sample.section}'`);
            }
        }
    }

    process.exit(0);
  } catch (err) {
    log('ERROR: ' + err);
    process.exit(1);
  }
};

run();
