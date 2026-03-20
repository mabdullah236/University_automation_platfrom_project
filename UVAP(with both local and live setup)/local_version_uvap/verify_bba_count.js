const mongoose = require('mongoose');
const StudentProfile = require('./backend/admin-service/src/models/StudentProfile');
require('dotenv').config({ path: './backend/admin-service/.env' });

const countBBA = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('Connected');

    const count = await StudentProfile.countDocuments({ program: 'BBA' });
    console.log(`BBA Students Remaining: ${count}`);

    process.exit(0);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

countBBA();
