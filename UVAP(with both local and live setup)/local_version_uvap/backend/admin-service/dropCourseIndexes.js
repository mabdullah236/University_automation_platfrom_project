const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

const dropIndexes = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');

    console.log('Dropping indexes on "courses" collection...');
    await mongoose.connection.collection('courses').dropIndexes();
    console.log('Indexes dropped successfully.');

    process.exit(0);
  } catch (err) {
    console.error('Error dropping indexes:', err);
    process.exit(1);
  }
};

dropIndexes();
