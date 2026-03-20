const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const StudentProfile = require('../models/StudentProfile');

const dumpStudents = async () => {
  try {
    console.log("Connecting to:", process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');

    const students = await StudentProfile.find({}).lean();
    console.log(`Found ${students.length} students.`);

    const dumpPath = path.join(__dirname, '../../student_dump.json');
    fs.writeFileSync(dumpPath, JSON.stringify(students, null, 2));
    console.log(`Dumped to ${dumpPath}`);

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

dumpStudents();
