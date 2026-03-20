const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config({ path: './.env' });

const log = (msg) => {
  console.log(msg);
  fs.appendFileSync('drop_log.txt', msg + '\n');
};

const fixIndexes = async () => {
  try {
    log('Starting fixIndexes...');
    // Force 127.0.0.1 to avoid localhost issues
    const uri = process.env.MONGO_URI.replace('localhost', '127.0.0.1');
    await mongoose.connect(uri);
    log('MongoDB Connected.');

    const collection = mongoose.connection.db.collection('users');
    const indexes = await collection.indexes();
    log(`Current Indexes: ${indexes.map(i => i.name).join(', ')}`);

    if (indexes.find(i => i.name === 'email_1')) {
      log('Dropping index: email_1');
      await collection.dropIndex('email_1');
      log('Index dropped successfully.');
    } else {
      log('Index email_1 not found.');
    }
    
    // Also check for any other unique index on email
    // Sometimes it might be named differently but key is { email: 1 }
    const emailIndex = indexes.find(i => i.key && i.key.email === 1);
    if (emailIndex && emailIndex.name !== 'email_1') {
       log(`Found another email index: ${emailIndex.name}. Dropping...`);
       await collection.dropIndex(emailIndex.name);
       log('Dropped alternative email index.');
    }

    process.exit();
  } catch (err) {
    log(`Error: ${err.message}`);
    process.exit(1);
  }
};

fixIndexes();
