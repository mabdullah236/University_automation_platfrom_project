const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const StudentProfile = require('../models/StudentProfile');

const migrateStudentStatus = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');

    const result = await StudentProfile.updateMany(
      { studentStatus: { $exists: false } },
      { $set: { studentStatus: 'Active' } }
    );

    console.log(`Migration Complete. Updated ${result.modifiedCount} students.`);
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

migrateStudentStatus();
