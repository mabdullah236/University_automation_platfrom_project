const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');
const connectDB = require('./src/config/db');

dotenv.config();
connectDB();

const testLogin = async () => {
  try {
    console.log('--- Starting Login Test ---');
    
    // 1. Cleanup
    await User.deleteOne({ email: 'testadmin@uvap.com' });

    // 2. Create User
    console.log('Creating test user...');
    const password = '1234';
    const user = await User.create({
      name: 'Test Admin',
      email: 'testadmin@uvap.com',
      password: password,
      role: 'admin',
      phone: '0000000000',
      isVerified: true
    });
    console.log('User created with ID:', user._id);

    // 3. Fetch User (with password)
    const fetchedUser = await User.findOne({ email: 'testadmin@uvap.com' }).select('+password');
    console.log('Fetched hashed password:', fetchedUser.password);

    // 4. Compare Password manually
    const isMatchManual = await bcrypt.compare(password, fetchedUser.password);
    console.log('Manual bcrypt compare result:', isMatchManual);

    // 5. Compare using Model method
    const isMatchMethod = await fetchedUser.matchPassword(password);
    console.log('Model matchPassword result:', isMatchMethod);

    if (isMatchMethod) {
      console.log('SUCCESS: Login logic is working.');
    } else {
      console.log('FAILURE: Login logic failed.');
    }

    process.exit();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

testLogin();
