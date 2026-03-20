const mongoose = require('mongoose');
const StudentProfile = require('./backend/admin-service/src/models/StudentProfile');
require('dotenv').config({ path: './backend/admin-service/.env' });

const forceDeleteBBA = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    console.log('Connected.');

    // 1. Count before delete
    const countBefore = await StudentProfile.countDocuments({ program: 'BBA' });
    console.log(`BBA Students found before delete: ${countBefore}`);

    if (countBefore > 0) {
      // 2. Delete
      const result = await StudentProfile.deleteMany({ program: 'BBA' });
      console.log(`Deleted ${result.deletedCount} BBA students.`);
    } else {
      console.log('No BBA students to delete.');
    }

    // 3. Verify
    const countAfter = await StudentProfile.countDocuments({ program: 'BBA' });
    console.log(`BBA Students remaining: ${countAfter}`);

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

forceDeleteBBA();
