const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

const fixEmails = async () => {
  try {
    console.log('Connecting...');
    const uri = process.env.MONGO_URI.replace('localhost', '127.0.0.1');
    await mongoose.connect(uri);
    console.log('Connected.');

    const User = require('../models/User');

    // Find users with missing or null uniEmail
    const users = await User.find({
      $or: [
        { uniEmail: { $exists: false } },
        { uniEmail: null },
        { uniEmail: '' }
      ]
    });

    console.log(`Found ${users.length} users with missing uniEmail.`);

    for (const user of users) {
      // Try to recover from old email field, or generate a unique dummy
      let newEmail = user.get('email'); // Access raw field if it exists in doc but not schema
      
      if (!newEmail || newEmail === '') {
        newEmail = `recovered_${user._id}@uvap.com`;
      }

      // Ensure personalEmail also exists
      if (!user.personalEmail) {
        user.personalEmail = `recovered_personal_${user._id}@gmail.com`;
      }

      user.uniEmail = newEmail;
      
      // We use updateOne to bypass schema validation if needed, but save() is better for hooks.
      // However, since we are fixing data to match schema, save() might fail if other fields are invalid.
      // Let's use updateOne to be safe and just patch the email.
      await User.collection.updateOne(
        { _id: user._id },
        { 
          $set: { 
            uniEmail: newEmail,
            personalEmail: user.personalEmail 
          } 
        }
      );
      
      console.log(`Fixed user ${user.name} (${user._id}) -> ${newEmail}`);
    }

    console.log('All users fixed.');
    process.exit();
  } catch (err) {
    console.error('Fix Error:', err);
    process.exit(1);
  }
};

fixEmails();
