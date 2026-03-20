const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: './.env' });

const fixIndexes = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');

    const db = mongoose.connection.db;
    const collection = db.collection('users');

    // List indexes to confirm
    const indexes = await collection.indexes();
    console.log('Current Indexes:', indexes.map(i => i.name));

    // Drop the problematic index
    if (indexes.find(i => i.name === 'email_1')) {
      console.log('Dropping index: email_1');
      await collection.dropIndex('email_1');
      console.log('Index dropped successfully.');
    } else {
      console.log('Index email_1 not found.');
    }

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

fixIndexes();
