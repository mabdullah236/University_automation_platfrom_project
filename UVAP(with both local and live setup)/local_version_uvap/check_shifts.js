const mongoose = require('mongoose');
const StudentProfile = require('./backend/admin-service/src/models/StudentProfile');
require('dotenv').config({ path: './backend/admin-service/.env' });

const checkShifts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected');

    const stats = await StudentProfile.aggregate([
      { $match: { program: 'BSSE' } },
      { $group: { _id: '$shift', count: { $sum: 1 } } }
    ]);

    console.log('BSSE Shift Distribution:', JSON.stringify(stats, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkShifts();
