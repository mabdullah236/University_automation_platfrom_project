const mongoose = require('mongoose');
const allocationService = require('./src/services/allocationService');
require('dotenv').config();

const run = async () => {
  try {
    const connStr = process.env.MONGO_URI || 'mongodb://localhost:27017/university_automation';
    await mongoose.connect(connStr);
    console.log('Connected to DB');

    console.log('Calling autoAssignAll(null)...');
    const result = await allocationService.autoAssignAll(null);
    console.log('Result:', result);

  } catch (err) {
    console.error('CRITICAL ERROR:', err);
  } finally {
    await mongoose.disconnect();
  }
};

run();
