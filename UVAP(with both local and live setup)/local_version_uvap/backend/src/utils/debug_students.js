const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const StudentProfile = require('../models/StudentProfile');

const fs = require('fs');

const log = (msg) => {
  console.log(msg);
  fs.appendFileSync('debug_output.txt', msg + '\n');
};

const checkStudents = async () => {
  log("Script started...");
  try {
    log("Connecting to MongoDB at " + process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    log('MongoDB Connected...');

    const total = await StudentProfile.countDocuments();
    log(`Total Students: ${total}`);

    const active = await StudentProfile.countDocuments({ studentStatus: 'Active' });
    log(`Active Students: ${active}`);

    const archived = await StudentProfile.countDocuments({ studentStatus: 'Archived' });
    log(`Archived Students: ${archived}`);

    const alumni = await StudentProfile.countDocuments({ studentStatus: 'Alumni' });
    log(`Alumni Students: ${alumni}`);

    const missing = await StudentProfile.countDocuments({ studentStatus: { $exists: false } });
    log(`Students with MISSING status: ${missing}`);

    if (missing > 0) {
        log("Found students with missing status. Fixing now...");
        const result = await StudentProfile.updateMany(
            { studentStatus: { $exists: false } },
            { $set: { studentStatus: 'Active' } }
        );
        log(`Fixed ${result.modifiedCount} students.`);
    }

    process.exit();
  } catch (err) {
    log(err.toString());
    process.exit(1);
  }
};

checkStudents();
