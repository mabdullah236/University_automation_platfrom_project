const mongoose = require('mongoose');
const StudentProfile = require('./backend/admin-service/src/models/StudentProfile');
require('dotenv').config({ path: './backend/admin-service/.env' });

const fastDebug = async () => {
  try {
    console.log('Connecting...');
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('Connected');

    const unassignedCount = await StudentProfile.countDocuments({ 
      program: 'BSSE', 
      section: null,
      studentStatus: 'Active'
    });

    console.log(`BSSE Active Students without Section: ${unassignedCount}`);
    
    const morningCount = await StudentProfile.countDocuments({
      program: 'BSSE',
      shift: 'Morning',
      studentStatus: 'Active'
    });
    console.log(`BSSE Active Morning Students Total: ${morningCount}`);

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
};

fastDebug();
