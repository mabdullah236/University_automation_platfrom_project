const mongoose = require('mongoose');
const CourseAllocation = require('./src/models/CourseAllocation');
const Timetable = require('./src/models/Timetable');
require('dotenv').config();

const run = async () => {
  try {
    // Connect to DB
    const connStr = process.env.MONGO_URI || 'mongodb://localhost:27017/university_automation';
    await mongoose.connect(connStr);
    console.log('Connected to DB');

    // Delete CourseAllocations
    const allocResult = await CourseAllocation.deleteMany({});
    console.log(`Deleted ${allocResult.deletedCount} CourseAllocation records.`);

    // Delete Timetables
    const timeResult = await Timetable.deleteMany({});
    console.log(`Deleted ${timeResult.deletedCount} Timetable records.`);

    console.log('Successfully cleared all Assign Teacher and Timetable data.');

  } catch (err) {
    console.error('Error clearing data:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from DB');
  }
};

run();
