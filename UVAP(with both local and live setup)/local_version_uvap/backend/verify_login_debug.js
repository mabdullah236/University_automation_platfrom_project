const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./src/models/User');
const connectDB = require('./src/config/db');

dotenv.config();

const debugLogin = async () => {
  try {
    console.log('--- Debugging Login ---');
    await connectDB();

    const email = 'admin@uvap.com';
    const password = '123456';

    console.log(`Searching for user: ${email}`);
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      console.log('❌ User NOT found in database.');
      process.exit(1);
    }

    console.log('✅ User found.');
    console.log(`Stored Password Hash: ${user.password}`);

    console.log(`Attempting to compare '${password}' with stored hash...`);
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      console.log('✅ Password MATCHES! Login should work.');
    } else {
      console.log('❌ Password does NOT match.');
      
      // Debug: Hash the input password to see what it looks like
      const testHash = await bcrypt.hash(password, 10);
      console.log(`Test Hash of input: ${testHash}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

debugLogin();
