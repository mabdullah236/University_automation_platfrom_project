const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

const listIndexes = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');

    const indexes = await mongoose.connection.collection('courses').indexes();
    console.log('Current Indexes on "courses":');
    console.log(JSON.stringify(indexes, null, 2));

    process.exit(0);
  } catch (err) {
    console.error('Error listing indexes:', err);
    process.exit(1);
  }
};

listIndexes();
