const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, 'src/config/config.env') });
const FacultyProfile = require('./src/models/FacultyProfile');

const checkFaculty = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const faculty = await FacultyProfile.find({ status: 'Active' }).limit(5).populate('user', 'name');
    fs.writeFileSync('faculty_debug.json', JSON.stringify(faculty, null, 2));
    console.log('Done');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkFaculty();
