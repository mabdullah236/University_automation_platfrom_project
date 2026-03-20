const mongoose = require('mongoose');
const User = require('./src/models/User');
const FacultyProfile = require('./src/models/FacultyProfile');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const checkFaculty = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/uvap_local', { serverSelectionTimeoutMS: 5000 });
    
    const userCount = await User.countDocuments({ role: 'faculty' });
    const profileCount = await FacultyProfile.countDocuments({});

    const output = `Faculty Users: ${userCount}\nFaculty Profiles: ${profileCount}`;
    fs.writeFileSync('faculty_counts.txt', output);
    console.log('Written to file');

  } catch (err) {
    fs.writeFileSync('faculty_counts.txt', `Error: ${err.message}`);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

checkFaculty();
