const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Fix for Ghost Index: Drop old indexes so Schema can rebuild them correctly
    try {
      await mongoose.connection.collection('courses').dropIndexes();
      console.log('Old Indexes Dropped & Rebuilt');
    } catch (err) {
      console.log('Index drop skipped (collection might not exist yet)');
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
