const mongoose = require('mongoose');

const run = async () => {
  try {
    console.log('Connecting...');
    await mongoose.connect('mongodb://localhost:27017/uvap_local');
    console.log('Connected.');

    const Course = require('./src/models/Course');
    
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

    console.log(`Deleted ${result.deletedCount} malformed courses.`);
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected.');
    process.exit(0);
  }
};

run();
