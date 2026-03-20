const mongoose = require('mongoose');
const StudentProfile = require('./backend/admin-service/src/models/StudentProfile');
require('dotenv').config({ path: './backend/admin-service/.env' });

const simpleDebug = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected');

    // Just find one BSSE student with section M1
    const student = await StudentProfile.findOne({ program: 'BSSE', section: 'M1' }).lean();
    console.log('BSSE M1 Student:', student);
    
    // Find one BSSE student with section null
    const unassigned = await StudentProfile.findOne({ program: 'BSSE', section: null }).lean();
    console.log('BSSE Unassigned:', unassigned);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

simpleDebug();
