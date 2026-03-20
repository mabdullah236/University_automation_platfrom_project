const mongoose = require('mongoose');
const FacultyProfile = require('./src/models/FacultyProfile');
const User = require('./src/models/User');

const run = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/university_automation');
    console.log('Connected to DB');

    const teacherUserId = '69269c77130a41cde977bf74'; // ID from the log for SE-101

    console.log(`Checking Teacher User ID: ${teacherUserId}`);

    const user = await User.findById(teacherUserId);
    console.log('User Record:', user);

    const profile = await FacultyProfile.findOne({ user: teacherUserId });
    console.log('Faculty Profile:', profile);

    if (profile) {
        console.log(`Status: ${profile.status}`);
    } else {
        console.log('No Faculty Profile found for this User ID');
    }

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
};

run();
