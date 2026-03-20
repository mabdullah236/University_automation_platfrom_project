const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, 'src/config/config.env') });
const StudentProfile = require('./src/models/StudentProfile');

const checkStudents = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const students = await StudentProfile.find({ batch: 'TEST-2025' }).limit(5);
    fs.writeFileSync('student_debug.json', JSON.stringify(students, null, 2));
    console.log('Done');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkStudents();
