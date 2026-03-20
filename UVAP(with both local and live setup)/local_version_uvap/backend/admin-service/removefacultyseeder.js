const mongoose = require('mongoose');
const User = require('./src/models/User');
const FacultyProfile = require('./src/models/FacultyProfile');
const dotenv = require('dotenv');

dotenv.config();

const removeFaculty = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/uvap_local', { serverSelectionTimeoutMS: 5000 });
    console.log('Connected to DB');

    // Find users with the specific email pattern used in the seeder
    const users = await User.find({ uniEmail: { $regex: /\.fac@uvap\.edu\.pk$/ } });
    
    if (users.length === 0) {
      console.log('No faculty found to remove.');
      return;
    }

    const userIds = users.map(u => u._id);
    console.log(`Found ${users.length} users to remove.`);

    // Delete Profiles
    const profileResult = await FacultyProfile.deleteMany({ user: { $in: userIds } });
    console.log(`Deleted ${profileResult.deletedCount} Faculty Profiles.`);

    // Delete Users
    const userResult = await User.deleteMany({ _id: { $in: userIds } });
    console.log(`Deleted ${userResult.deletedCount} Users.`);

    console.log('Done!');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
};

removeFaculty();
