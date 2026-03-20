const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, 'src/config/config.env') });

const CourseAllocation = require('./src/models/CourseAllocation');
const Course = require('./src/models/Course');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

const debugAllocations = async () => {
  await connectDB();

  const batches = await CourseAllocation.distinct('batch');
  console.log('Available Batches in Allocations:', batches);

  if (batches.length > 0) {
    const testBatch = batches[0];
    console.log(`\nChecking Batch: ${testBatch}`);
    
    const total = await CourseAllocation.countDocuments({ batch: testBatch });
    const unassigned = await CourseAllocation.countDocuments({ batch: testBatch, teacher: null });
    const assigned = await CourseAllocation.countDocuments({ batch: testBatch, teacher: { $ne: null } });

    console.log(`Total Allocations: ${total}`);
    console.log(`Unassigned (teacher: null): ${unassigned}`);
    console.log(`Assigned: ${assigned}`);

    if (unassigned === 0) {
        console.log('\nWARNING: No unassigned allocations found. autoAssignAll will do nothing.');
        console.log('This implies that either all courses are assigned, OR unassigned courses do not have Allocation records yet.');
    }
  } else {
      console.log('No CourseAllocation records found at all.');
  }

  process.exit();
};

debugAllocations();
