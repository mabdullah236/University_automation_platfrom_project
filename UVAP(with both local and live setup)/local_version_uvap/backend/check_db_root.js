const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load env vars
dotenv.config();

const StudentProfile = require('./src/models/StudentProfile');

const dumpStudents = async () => {
  try {
    const uri = process.env.MONGO_URI.replace('localhost', '127.0.0.1');
    console.log("Connecting to:", uri);
    await mongoose.connect(uri);
    console.log('MongoDB Connected...');

    const students = await StudentProfile.find({}).lean();
    console.log(`Found ${students.length} students.`);

    const dumpPath = path.join(__dirname, 'student_dump.json');
    fs.writeFileSync(dumpPath, JSON.stringify(students, null, 2));
    console.log(`Dumped to ${dumpPath}`);

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

dumpStudents();
