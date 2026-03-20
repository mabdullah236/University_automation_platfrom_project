const mongoose = require('mongoose');
const StudentProfile = require('./src/models/StudentProfile');

console.log('STARTING SCRIPT...');

const run = async () => {
  try {
    console.log('Connecting to DB...');
    await mongoose.connect('mongodb://127.0.0.1:27017/uvap_local');
    console.log('Connected to DB');

    const query = {
      batch: { $regex: '^Fall 2025$', $options: 'i' },
      program: { $regex: '^BSCS$', $options: 'i' },
      currentSemester: 1,
      section: 'A'
    };

    const count = await StudentProfile.countDocuments(query);
    console.log(`Found ${count} students in Section A.`);

    const result = await StudentProfile.updateMany(query, { $set: { section: 'Unassigned' } });
    console.log(`Updated ${result.modifiedCount} students to Unassigned.`);

    process.exit(0);
  } catch (err) {
    console.error('ERROR:', err);
    process.exit(1);
  }
};

run();
