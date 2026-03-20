const mongoose = require('mongoose');
const Course = require('./src/models/Course');
const dotenv = require('dotenv');

dotenv.config();

const listCourses = async () => {
  try {
    // Use the robust connection string
    await mongoose.connect('mongodb://127.0.0.1:27017/uvap_local', { serverSelectionTimeoutMS: 5000 });
    console.log('Connected to DB');

    const fs = require('fs');
    const log = (msg) => {
      console.log(msg);
      fs.appendFileSync('bscs_courses.txt', msg + '\n');
    };

    const courses = await Course.find({ program: 'BSCS', semester: 1 });
    log(`\nFound ${courses.length} courses for BSCS Semester 1:`);
    log('------------------------------------------------');
    courses.forEach(c => {
      log(`Title: "${c.title}" | Code: "${c.code}" | ID: ${c._id}`);
    });
    log('------------------------------------------------\n');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
};

listCourses();
