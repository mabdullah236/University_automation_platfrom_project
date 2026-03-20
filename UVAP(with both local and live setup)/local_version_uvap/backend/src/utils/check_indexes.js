const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

const checkIndexes = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const indexes = await mongoose.connection.db.collection('users').indexes();
    console.log('Indexes on users collection:');
    console.log(JSON.stringify(indexes, null, 2));
    
    process.exit();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkIndexes();
