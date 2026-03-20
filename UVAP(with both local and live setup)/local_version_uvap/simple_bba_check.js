const mongoose = require('mongoose');
const StudentProfile = require('./backend/admin-service/src/models/StudentProfile');
const Department = require('./backend/admin-service/src/models/Department');
require('dotenv').config({ path: './backend/admin-service/.env' });

const simpleCheck = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('Connected');

    const bbaCount = await StudentProfile.countDocuments({ program: 'BBA' });
    console.log(`BBA Students: ${bbaCount}`);

    const bbaDept = await Department.findOne({ programCode: 'BBA' });
    console.log(`BBA Department: ${bbaDept ? 'Exists' : 'Missing'}`);

    process.exit(0);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

simpleCheck();
