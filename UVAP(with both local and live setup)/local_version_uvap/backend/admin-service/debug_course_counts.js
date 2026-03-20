const mongoose = require('mongoose');
const Course = require('./src/models/Course');
const dotenv = require('dotenv');

dotenv.config();

const debugCounts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/uvap_local', { serverSelectionTimeoutMS: 5000 });
    console.log('Connected to DB');

    const fs = require('fs');
    const log = (msg) => {
      console.log(msg);
      fs.appendFileSync('debug_counts.txt', msg + '\n');
    };

    const allCourses = await Course.find({});
    log(`Total courses found: ${allCourses.length}`);

    const courseMap = {}; // { "Program-Semester": Set(titles) }

    allCourses.forEach(c => {
      // Log raw values for BSCS Sem 1 to see potential issues
      if (c.program === 'BSCS' && c.semester === 1) {
        log(`[BSCS-1] Title: "${c.title}", Code: "${c.code}"`);
      }

      const key = `${c.program}-${c.semester}`;
      if (!courseMap[key]) {
        courseMap[key] = new Set();
      }
      courseMap[key].add(c.title.trim().toLowerCase());
    });

    log('\n--- Course Counts per Program/Semester ---');
    for (const key in courseMap) {
      log(`${key}: ${courseMap[key].size}`);
    }

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
};

debugCounts();
