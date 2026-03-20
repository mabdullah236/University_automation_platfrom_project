const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

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

// Define minimal schema to avoid dependency issues
const studentProfileSchema = new mongoose.Schema({
  section: {
    type: String,
    default: null
  }
}, { strict: false });

const StudentProfile = mongoose.model('StudentProfile', studentProfileSchema);

const cleanup = async () => {
  await connectDB();

  try {
    console.log('Starting Cleanup...');

    // 1. Clear 'Section A'
    const resultA = await StudentProfile.updateMany(
      { section: 'A' },
      { $set: { section: null } }
    );
    console.log(`Found ${resultA.matchedCount} students in Section A. Cleared successfully (Updated: ${resultA.modifiedCount}).`);

    // 2. Clear Empty Strings
    const resultEmpty = await StudentProfile.updateMany(
      { section: "" },
      { $set: { section: null } }
    );
    console.log(`Found ${resultEmpty.matchedCount} students with empty section. Cleared successfully (Updated: ${resultEmpty.modifiedCount}).`);

    console.log('Cleanup Complete.');
    process.exit();
  } catch (error) {
    console.error('Cleanup Failed:', error);
    process.exit(1);
  }
};

cleanup();
