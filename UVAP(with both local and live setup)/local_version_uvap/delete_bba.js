const mongoose = require('mongoose');
const StudentProfile = require('./backend/admin-service/src/models/StudentProfile');
const User = require('./backend/admin-service/src/models/User'); // Assuming students have User accounts too
require('dotenv').config({ path: './backend/admin-service/.env' });

const deleteBBA = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    // 1. Find BBA Students
    const bbaStudents = await StudentProfile.find({ program: 'BBA' });
    console.log(`Found ${bbaStudents.length} BBA students to delete.`);

    if (bbaStudents.length === 0) {
      console.log('No BBA students found.');
      process.exit(0);
    }

    // 2. Extract User IDs for cleanup
    const userIds = bbaStudents.map(s => s.user).filter(id => id);

    // 3. Delete Student Profiles
    const deleteResult = await StudentProfile.deleteMany({ program: 'BBA' });
    console.log(`Deleted ${deleteResult.deletedCount} Student Profiles.`);

    // 4. Delete Associated Users (Optional but recommended for clean slate)
    if (userIds.length > 0) {
      const userDeleteResult = await User.deleteMany({ _id: { $in: userIds } });
      console.log(`Deleted ${userDeleteResult.deletedCount} associated User accounts.`);
    }

    process.exit(0);
  } catch (err) {
    console.error('Error deleting BBA students:', err);
    process.exit(1);
  }
};

deleteBBA();
