const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');
const connectDB = require('./src/config/db');

dotenv.config();
connectDB();

const checkUser = async () => {
  try {
    console.log('Checking for Admin user...');
    const user = await User.findOne({ email: 'admin@uvap.com' });
    if (user) {
      console.log('SUCCESS: Admin user found:', user.email);
      console.log('Role:', user.role);
    } else {
      console.log('FAILURE: Admin user NOT found.');
    }
    process.exit();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkUser();
