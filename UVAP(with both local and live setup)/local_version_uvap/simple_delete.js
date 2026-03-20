const mongoose = require('mongoose');
const StudentProfile = require('./backend/admin-service/src/models/StudentProfile');
require('dotenv').config({ path: './backend/admin-service/.env' });

const simpleDelete = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('Connected');

    const result = await StudentProfile.deleteMany({ program: 'BBA' });
    console.log(`Deleted ${result.deletedCount} BBA students.`);

    process.exit(0);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

simpleDelete();
