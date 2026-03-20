const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../src/config/db');
const User = require('../src/models/User');

dotenv.config();
connectDB();

const migrateRollNumbers = async () => {
  try {
    console.log('Starting Migration...');
    const students = await User.find({ role: 'student', rollNumber: { $exists: false } });

    console.log(`Found ${students.length} students without Roll Number.`);

    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      // Generate a unique roll number based on year and index
      // Using a simple counter strategy or random for now to avoid collision in this script
      // In production, you'd want a more robust sequence generator
      const rollNo = `2023-CS-MIG-${String(i + 1).padStart(3, '0')}`;
      
      student.rollNumber = rollNo;
      await student.save();
      console.log(`Updated ${student.name} with Roll No: ${rollNo}`);
    }

    console.log('Migration Completed!');
    process.exit();
  } catch (error) {
    console.error('Migration Failed:', error);
    process.exit(1);
  }
};

migrateRollNumbers();
