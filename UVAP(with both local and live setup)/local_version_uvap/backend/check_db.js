const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');

dotenv.config();

console.log('Attempting to connect...');
connectDB().then(() => {
  console.log('Connection successful!');
  process.exit(0);
}).catch(err => {
  console.error('Connection failed:', err);
  process.exit(1);
});
