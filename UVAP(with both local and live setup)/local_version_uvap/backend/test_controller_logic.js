const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config();

const StudentProfile = require('./src/models/StudentProfile');

const fs = require('fs');
const log = (msg) => {
  console.log(msg);
  fs.appendFileSync('test_output.txt', msg + '\n');
};

const testLogic = async () => {
  try {
    const uri = process.env.MONGO_URI.replace('localhost', '127.0.0.1');
    log("Connecting to: " + uri);
    await mongoose.connect(uri);
    log('MongoDB Connected...');

    const query = { studentStatus: 'Active' };
    log("Querying with: " + JSON.stringify(query));

    const students = await StudentProfile.find(query);
    log(`Found ${students.length} students.`);
    
    if (students.length > 0) {
        log("First student: " + JSON.stringify(students[0]));
    }

    process.exit();
  } catch (err) {
    log(err.toString());
    process.exit(1);
  }
};

testLogic();
