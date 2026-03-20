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

const studentProfileSchema = new mongoose.Schema({}, { strict: false });
const StudentProfile = mongoose.model('StudentProfile', studentProfileSchema);

const findDup = async () => {
  await connectDB();
  const id = "BSCS-M1-25-01";
  console.log(`Searching for studentId: ${id}`);
  
  const student = await StudentProfile.findOne({ studentId: id });
  if (student) {
    console.log('FOUND DUPLICATE HOLDER:');
    console.log(JSON.stringify(student, null, 2));
  } else {
    console.log('No student found with this ID.');
  }
  process.exit();
};

findDup();
