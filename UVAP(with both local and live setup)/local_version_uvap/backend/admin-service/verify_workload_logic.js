const mongoose = require('mongoose');
const User = require('./src/models/User');
const FacultyProfile = require('./src/models/FacultyProfile');
const CourseAllocation = require('./src/models/CourseAllocation');
const fs = require('fs');

const MONGO_URI = 'mongodb://127.0.0.1:27017/uvap_local';

const log = (msg) => {
  console.log(msg);
  fs.appendFileSync('verify_workload_output.txt', msg + '\n');
};

const run = async () => {
  try {
    fs.writeFileSync('verify_workload_output.txt', 'Starting Workload Verification...\n');
    await mongoose.connect(MONGO_URI);
    log('Connected to DB');

    // 1. Fetch some faculty
    const faculty = await FacultyProfile.find().limit(5).populate('user');
    log(`Fetched ${faculty.length} faculty members.`);

    if (faculty.length === 0) {
        log('No faculty found to test.');
        return;
    }

    // 2. Run the aggregation logic I implemented
    const userIds = faculty.map(f => f.user?._id);
    
    const workloadCounts = await CourseAllocation.aggregate([
      { $match: { teacher: { $in: userIds } } },
      { $group: { _id: '$teacher', count: { $sum: 1 } } }
    ]);

    const workloadMap = {};
    workloadCounts.forEach(w => {
      workloadMap[w._id.toString()] = w.count;
    });

    // 3. Log results
    faculty.forEach(f => {
        const count = workloadMap[f.user?._id.toString()] || 0;
        log(`Faculty: ${f.user?.name || 'Unknown'} - Workload: ${count}`);
    });

    log('Verification Complete.');

  } catch (err) {
    log('ERROR: ' + err.message);
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
};

run();
