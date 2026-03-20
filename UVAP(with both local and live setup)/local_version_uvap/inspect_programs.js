const mongoose = require('mongoose');
const StudentProfile = require('./backend/admin-service/src/models/StudentProfile');
require('dotenv').config({ path: './backend/admin-service/.env' });

const inspectPrograms = async () => {
  try {
    console.log('Connecting...');
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('Connected.');

    // 1. List all distinct programs
    const programs = await StudentProfile.distinct('program');
    console.log('Distinct Programs found in DB:', JSON.stringify(programs, null, 2));

    // 2. Check for "BBA" with regex (case insensitive, whitespace)
    const bbaRegex = await StudentProfile.find({ program: { $regex: /BBA/i } }).limit(5).select('program studentId').lean();
    console.log('Sample students matching /BBA/i:', JSON.stringify(bbaRegex, null, 2));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

inspectPrograms();
