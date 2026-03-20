const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

const migrate = async () => {
  try {
    console.log('Connecting...');
    // Force 127.0.0.1
    const uri = process.env.MONGO_URI.replace('localhost', '127.0.0.1');
    await mongoose.connect(uri);
    console.log('Connected.');

    const collection = mongoose.connection.db.collection('users');

    console.log('Renaming "email" to "uniEmail" for all users...');
    
    // Use MongoDB's $rename operator
    const result = await collection.updateMany(
      { email: { $exists: true }, uniEmail: { $exists: false } },
      { $rename: { "email": "uniEmail" } }
    );

    console.log(`Migration complete. Modified ${result.modifiedCount} documents.`);

    process.exit();
  } catch (err) {
    console.error('Migration Error:', err);
    process.exit(1);
  }
};

migrate();
