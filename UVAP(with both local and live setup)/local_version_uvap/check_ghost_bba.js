const mongoose = require('mongoose');
const StudentProfile = require('./backend/admin-service/src/models/StudentProfile');
const Department = require('./backend/admin-service/src/models/Department');
require('dotenv').config({ path: './backend/admin-service/.env' });

const checkGhostData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected');

    // 1. Check for BBA Students
    const bbaStudents = await StudentProfile.countDocuments({ program: 'BBA' });
    console.log(`StudentProfile records with program 'BBA': ${bbaStudents}`);

    // 2. Check for BBA Department
    const bbaDept = await Department.findOne({ programCode: 'BBA' });
    console.log(`Department with programCode 'BBA':`, bbaDept ? 'Found' : 'NOT FOUND');

    // 3. List all Departments
    const allDepts = await Department.find({}).select('programCode');
    console.log('All Active Departments:', allDepts.map(d => d.programCode));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkGhostData();
