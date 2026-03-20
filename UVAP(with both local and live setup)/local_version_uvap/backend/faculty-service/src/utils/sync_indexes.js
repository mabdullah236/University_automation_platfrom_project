const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config({ path: './.env' });

const sync = async () => {
  try {
    console.log('Connecting...');
    const uri = process.env.MONGO_URI.replace('localhost', '127.0.0.1');
    await mongoose.connect(uri);
    console.log('Connected.');

    console.log('Syncing indexes for User model...');
    await User.syncIndexes();
    console.log('Indexes synced successfully.');

    const indexes = await User.collection.indexes();
    console.log('Current Indexes:', indexes.map(i => i.name));

    process.exit();
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

sync();
