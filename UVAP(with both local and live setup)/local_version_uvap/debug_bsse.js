const mongoose = require('mongoose');
const StudentProfile = require('./backend/admin-service/src/models/StudentProfile');
require('dotenv').config({ path: './backend/admin-service/.env' });

const debugBSSE = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    // 1. Count Total BSSE Students
    const totalBSSE = await StudentProfile.countDocuments({ program: 'BSSE' });
    console.log(`Total BSSE Students: ${totalBSSE}`);

    // 2. Count BSSE Students with Section starting with 'M'
    const morningSections = await StudentProfile.countDocuments({ 
      program: 'BSSE', 
      section: { $regex: /^M/ } 
    });
    console.log(`BSSE Students in 'M' sections: ${morningSections}`);

    // 3. Inspect a few BSSE students who SHOULD be in Morning
    // Look for students who have section 'M1', 'M2', etc.
    const sampleMorning = await StudentProfile.find({ 
      program: 'BSSE', 
      section: { $regex: /^M/ } 
    }).limit(5).lean();

    console.log('Sample BSSE Morning Students:', JSON.stringify(sampleMorning, null, 2));

    // 4. Check if they are Active
    if (sampleMorning.length > 0) {
        const notActive = sampleMorning.filter(s => s.studentStatus !== 'Active');
        console.log(`Found ${notActive.length} non-Active students in Morning sections.`);
    } else {
        console.log("No students found in BSSE Morning sections (M1, M2, etc.)");
        
        // Check if there are unassigned students who should be Morning
        const unassigned = await StudentProfile.find({
            program: 'BSSE',
            section: null
        }).limit(5).select('shift studentStatus').lean();
        console.log("Sample Unassigned BSSE Students:", unassigned);
    }

    mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
};

debugBSSE();
