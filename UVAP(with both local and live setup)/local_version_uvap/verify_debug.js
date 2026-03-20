const mongoose = require('mongoose');
const StudentProfile = require('./backend/admin-service/src/models/StudentProfile');
const Department = require('./backend/admin-service/src/models/Department');
require('dotenv').config({ path: './backend/admin-service/.env' });

const verifySections = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    // 1. Check BSSE Sections
    const stats = await StudentProfile.aggregate([
      { $match: { program: 'BSSE', studentStatus: 'Active', section: { $ne: null } } },
      {
        $group: {
          _id: {
            program: '$program',
            section: '$section',
            shift: '$shift' // Check raw shift
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.section': 1 } }
    ]);

    console.log('BSSE Sections Found:', JSON.stringify(stats, null, 2));

    // 2. Check Departments for Dropdown
    const departments = await Department.find({}).select('programCode');
    console.log('Active Departments:', departments.map(d => d.programCode));

    mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
};

verifySections();
