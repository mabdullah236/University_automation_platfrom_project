const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./src/models/User');
const StudentProfile = require('./src/models/StudentProfile');

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/uvap_local');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const departments = [
  { name: 'Computer Science', code: 'BSCS' },
  { name: 'Software Engineering', code: 'BSSE' },
  { name: 'Information Technology', code: 'BSIT' },
  { name: 'Business Administration', code: 'BBA' }
];

const shifts = ['Morning', 'Evening'];
const BATCH = 'TEST-2025';
const PASSWORD = '12345678'; // Will be hashed by User model pre-save hook

const generateRandomDigits = (length) => {
  let result = '';
  const characters = '0123456789';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const seed = async () => {
  await connectDB();

  console.log('Starting Mass Seeder...');
  console.log(`Batch: ${BATCH}`);
  console.log('-----------------------------------');

  let totalCreated = 0;

  try {
    for (const dept of departments) {
      console.log(`Processing Department: ${dept.name}...`);

      for (const shift of shifts) {
        console.log(`  Processing Shift: ${shift}...`);
        
        const studentsToCreate = [];
        const usersToCreate = [];

        for (let i = 1; i <= 100; i++) {
          // Data Generation
          const deptShort = dept.code.toLowerCase();
          const shiftShort = shift.charAt(0).toLowerCase();
          const name = `Student ${dept.code} ${shift.charAt(0)} ${i}`;
          const uniEmail = `s.${deptShort}.${shiftShort}.${i}@uvap.com`;
          const personalEmail = `test.${deptShort}.${shiftShort}.${i}@gmail.com`;
          const phone = generateRandomDigits(11);
          const cnic = generateRandomDigits(13);
          
          // Temporary Student ID (Required by Schema, but not the final Roll No)
          const tempId = `TEMP-${cnic}`;

          // Check if user exists (to avoid duplicate key error on re-runs)
          const userExists = await User.findOne({ uniEmail });
          if (userExists) {
            process.stdout.write('s'); // Skip indicator
            continue;
          }

          const user = await User.create({
            name,
            uniEmail,
            personalEmail,
            password: PASSWORD,
            role: 'student',
            phone,
            // rollNumber: Not set (will be null/undefined)
            isVerified: true
          });

          // Create Profile
          await StudentProfile.create({
            user: user._id,
            studentId: tempId, // Using Temp ID as placeholder
            cnic,
            program: dept.code,
            batch: BATCH,
            // section: Not set (will be null)
            shift,
            currentSemester: 1,
            dob: new Date('2000-01-01'),
            address: 'Test Address 123',
            guardianName: `Guardian ${i}`,
            guardianPhone: generateRandomDigits(11),
            studentStatus: 'Active'
          });

          totalCreated++;
          process.stdout.write('.'); // Progress indicator
        }
        console.log(`\n  Done with ${shift}.`);
      }
    }

    console.log('-----------------------------------');
    console.log(`Seeding Complete! Total Students Created: ${totalCreated}`);
    process.exit();
  } catch (error) {
    console.error('\nSeeding Failed:', error);
    process.exit(1);
  }
};

seed();
