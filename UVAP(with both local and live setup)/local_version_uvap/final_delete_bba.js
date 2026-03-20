const mongoose = require('mongoose');
const StudentProfile = require('./backend/admin-service/src/models/StudentProfile');
require('dotenv').config({ path: './backend/admin-service/.env' });

const finalDelete = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected successfully.');

    const initialCount = await StudentProfile.countDocuments({ program: 'BBA' });
    console.log(`Found ${initialCount} BBA students.`);

    if (initialCount > 0) {
      console.log('Deleting BBA students...');
      const result = await StudentProfile.deleteMany({ program: 'BBA' });
      console.log(`Deletion complete. Deleted count: ${result.deletedCount}`);
    } else {
      console.log('No BBA students found to delete.');
    }

    const finalCount = await StudentProfile.countDocuments({ program: 'BBA' });
    console.log(`Final Verification - BBA Students remaining: ${finalCount}`);

    console.log('Closing connection...');
    await mongoose.connection.close();
    console.log('Done.');
  } catch (err) {
    console.error('Error during deletion:', err);
  }
};

finalDelete();
