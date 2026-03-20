const mongoose = require('mongoose');
const StudentProfile = require('./src/models/StudentProfile');

const run = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/uvap_local');
    console.log('Connected');

    const students = await StudentProfile.find({
      program: 'BSCS',
      batch: 'Fall 2025'
    }).limit(5);

    console.log(`Found ${students.length}`);
    students.forEach(s => {
      console.log(`SEC: '${s.section}' TYPE: ${typeof s.section}`);
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
