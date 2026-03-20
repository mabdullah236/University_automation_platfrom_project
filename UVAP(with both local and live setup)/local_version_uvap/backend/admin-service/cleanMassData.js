const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./src/models/User');
const StudentProfile = require('./src/models/StudentProfile');

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/uvap_local');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const BATCH = 'TEST-2025';

const cleanup = async () => {
  await connectDB();

  try {
    console.log(`Starting Cleanup for Batch: ${BATCH}...`);

    // 1. Find Profiles
    const profiles = await StudentProfile.find({ batch: BATCH });
    console.log(`Found ${profiles.length} profiles to delete.`);

    if (profiles.length === 0) {
      console.log('No data found.');
      process.exit();
    }

    // 2. Extract User IDs
    const userIds = profiles.map(p => p.user);

    // 3. Delete Users
    const userResult = await User.deleteMany({ _id: { $in: userIds } });
    console.log(`Deleted ${userResult.deletedCount} Users.`);

    // 4. Delete Profiles
    const profileResult = await StudentProfile.deleteMany({ batch: BATCH });
    console.log(`Deleted ${profileResult.deletedCount} Student Profiles.`);

    console.log('Cleanup Complete.');
    process.exit();
  } catch (error) {
    console.error('Cleanup Failed:', error);
    process.exit(1);
  }
};

cleanup();
