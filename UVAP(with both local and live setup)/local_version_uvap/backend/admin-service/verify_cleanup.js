const mongoose = require('mongoose');
const Course = require('./src/models/Course');

const run = async () => {
  try {
    const connStr = 'mongodb://localhost:27017/uvap_local';
    await mongoose.connect(connStr);
    console.log('Connected to DB');

    const count = await Course.countDocuments({
        $or: [
            { code: { $exists: false } },
            { code: null },
            { code: '' },
            { title: { $exists: false } },
            { title: null },
            { title: '' }
        ]
    });

    console.log(`Remaining malformed courses: ${count}`);

    if (count > 0) {
        console.log('Deleting remaining...');
        const result = await Course.deleteMany({
            $or: [
                { code: { $exists: false } },
                { code: null },
                { code: '' },
                { title: { $exists: false } },
                { title: null },
                { title: '' }
            ]
        });
        console.log(`Deleted ${result.deletedCount} courses.`);
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Done');
    process.exit(0);
  }
};

run();
