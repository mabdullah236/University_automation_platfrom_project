const mongoose = require('mongoose');
const Course = require('./src/models/Course');
const dotenv = require('dotenv');

dotenv.config();

const fixDuplicates = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/uvap_local');
    console.log('Connected to DB');

    const courses = await Course.find({});
    const courseMap = {}; // { "Program-Semester-Title": [ids] }

    // Group courses
    courses.forEach(c => {
      const key = `${c.program}-${c.semester}-${c.title.trim().toLowerCase()}`;
      if (!courseMap[key]) {
        courseMap[key] = [];
      }
      courseMap[key].push(c);
    });

    let deletedCount = 0;

    for (const key in courseMap) {
      const group = courseMap[key];
      if (group.length > 1) {
        console.log(`Found duplicate for: ${key} (${group.length} entries)`);
        
        // Sort by creation date (keep oldest) or prefer one with a code
        group.sort((a, b) => {
            // Prefer having a code
            if (a.code && !b.code) return -1;
            if (!a.code && b.code) return 1;
            // Then prefer older
            return a._id.getTimestamp() - b._id.getTimestamp();
        });

        const toKeep = group[0];
        const toDelete = group.slice(1);

        console.log(`Keeping: ${toKeep.title} (${toKeep._id})`);
        
        for (const c of toDelete) {
            console.log(`Deleting: ${c.title} (${c._id})`);
            await Course.findByIdAndDelete(c._id);
            deletedCount++;
        }
      }
    }

    console.log(`Cleanup complete. Deleted ${deletedCount} duplicate courses.`);

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
};

fixDuplicates();
