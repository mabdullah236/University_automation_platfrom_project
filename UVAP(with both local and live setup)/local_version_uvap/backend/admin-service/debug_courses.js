const mongoose = require('mongoose');
const Course = require('./src/models/Course');
const dotenv = require('dotenv');

dotenv.config();

const debugCourses = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const courses = await Course.find({ program: 'BSCS', semester: 1 });
    console.log(`Found ${courses.length} courses for BSCS Semester 1:`);
    courses.forEach(c => {
      console.log(`- ${c.title} (${c.code}) [${c._id}]`);
    });

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
};

debugCourses();
