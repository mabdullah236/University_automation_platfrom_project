const mongoose = require('mongoose');

const run = async () => {
  try {
    console.log('Attempting to connect to DB...');
    // Use 127.0.0.1 and add timeout options
    await mongoose.connect('mongodb://127.0.0.1:27017/uvap_local', {
      serverSelectionTimeoutMS: 5000
    });
    console.log('Connected to DB');

    const FacultyProfile = mongoose.model('FacultyProfile', new mongoose.Schema({
      department: String
    }));

    const departments = await FacultyProfile.distinct('department');
    console.log('Distinct Departments:', departments);

    process.exit();
  } catch (err) {
    console.error('Connection Error:', err);
    process.exit(1);
  }
};

run();
