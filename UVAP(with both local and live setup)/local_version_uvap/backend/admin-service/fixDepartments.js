const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

// Connect to DB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('Connection Error:', err.message);
    process.exit(1);
  }
};

// Mappings
const mappings = {
  'CS': 'Computer Science',
  'SE': 'Software Engineering',
  'IT': 'Information Technology',
  'BBA': 'Business Administration',
  'EE': 'Electrical Engineering',
  'Math': 'Mathematics'
};

const run = async () => {
  await connectDB();

  // Load Models
  const Course = require('./src/models/Course');
  const FacultyProfile = require('./src/models/FacultyProfile');
  const StudentProfile = require('./src/models/StudentProfile');

  try {
    console.log('Starting Normalization...');

    for (const [short, full] of Object.entries(mappings)) {
      console.log(`\nProcessing Mapping: '${short}' -> '${full}'`);

      // 1. Course (department field)
      const courseRes = await Course.updateMany(
        { department: short },
        { $set: { department: full } }
      );
      if (courseRes.modifiedCount > 0) {
        console.log(`  [Course] Updated ${courseRes.modifiedCount} records.`);
      }

      // 2. FacultyProfile (department field)
      const facultyRes = await FacultyProfile.updateMany(
        { department: short },
        { $set: { department: full } }
      );
      if (facultyRes.modifiedCount > 0) {
        console.log(`  [FacultyProfile] Updated ${facultyRes.modifiedCount} records.`);
      }

      // 3. StudentProfile (program field)
      // Note: User requested to update program (or department) field.
      // StudentProfile has 'program'.
      const studentRes = await StudentProfile.updateMany(
        { program: short },
        { $set: { program: full } }
      );
      if (studentRes.modifiedCount > 0) {
        console.log(`  [StudentProfile] Updated ${studentRes.modifiedCount} records.`);
      }
    }

    console.log('\nNormalization Complete!');
    process.exit(0);
  } catch (err) {
    console.error('Error during normalization:', err);
    process.exit(1);
  }
};

run();
