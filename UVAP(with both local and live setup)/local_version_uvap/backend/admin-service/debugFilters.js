const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/uvap_local');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Define minimal schema
const studentProfileSchema = new mongoose.Schema({
  batch: String,
  program: String,
  studentStatus: String
}, { strict: false });

const StudentProfile = mongoose.model('StudentProfile', studentProfileSchema);

const checkFilters = async () => {
  await connectDB();

  try {
    console.log('Checking Student Filters...');

    const activeCount = await StudentProfile.countDocuments({ studentStatus: 'Active' });
    console.log(`Total Active Students: ${activeCount}`);

    const batches = await StudentProfile.distinct('batch', { studentStatus: 'Active' });
    console.log('Distinct Batches (Active):', batches);

    const programs = await StudentProfile.distinct('program', { studentStatus: 'Active' });
    console.log('Distinct Programs (Active):', programs);

    const allBatches = await StudentProfile.distinct('batch');
    console.log('All Batches (Any Status):', allBatches);

    process.exit();
  } catch (error) {
    console.error('Check Failed:', error);
    process.exit(1);
  }
};

checkFilters();
