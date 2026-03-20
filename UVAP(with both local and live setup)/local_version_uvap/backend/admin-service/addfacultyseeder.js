const mongoose = require('mongoose');
const User = require('./src/models/User');
const FacultyProfile = require('./src/models/FacultyProfile');
const dotenv = require('dotenv');

dotenv.config();

const realNames = [
  "Muhammad Ali", "Kashan Raza", "Ahmed Khan", "Fatima Bibi", "Zainab Malik",
  "Usman Tariq", "Ayesha Siddiqui", "Bilal Ahmed", "Sana Mir", "Hassan Raza",
  "Mariam Yusuf", "Omar Farooq", "Hira Khan", "Ali Hassan", "Sadia Parveen",
  "Imran Khan", "Nida Yasir", "Fahad Mustafa", "Mahira Khan", "Atif Aslam",
  "Sajal Aly", "Feroze Khan", "Yumna Zaidi", "Hamza Ali Abbasi", "Ayeza Khan",
  "Danish Taimoor", "Maya Ali", "Sheheryar Munawar", "Syra Yousuf", "Ahad Raza Mir",
  "Iqra Aziz", "Yasir Hussain", "Sarah Khan", "Falak Shabir", "Urwa Hocane",
  "Mawra Hocane", "Farhan Saeed", "Hania Aamir", "Asim Azhar", "Momina Mustehsan",
  "Ali Zafar", "Shafqat Amanat Ali", "Rahat Fateh Ali Khan", "Abida Parveen"
];

const seedFaculty = async () => {
  try {
    console.log('Starting Seeder...');
    await mongoose.connect('mongodb://127.0.0.1:27017/uvap_local', { serverSelectionTimeoutMS: 5000 });
    console.log('Connected to DB');

    // Clean up existing seeded users first to avoid duplicates
    console.log('Cleaning up old seeded data...');
    const existingUsers = await User.find({ uniEmail: { $regex: /\.fac@uvap\.edu\.pk$/ } });
    const existingUserIds = existingUsers.map(u => u._id);
    await FacultyProfile.deleteMany({ user: { $in: existingUserIds } });
    await User.deleteMany({ _id: { $in: existingUserIds } });
    console.log('Cleanup done.');

    let nameIndex = 0;
    let count = 0;

    // Configuration for Faculty Distribution
    const facultyGroups = [
      { 
        count: 8, 
        dept: 'Mathematics', 
        spec: 'Mathematics', 
        qual: { degree: 'PhD Mathematics', institution: 'PU' } 
      },
      { 
        count: 4, 
        dept: 'Islamic Studies', 
        spec: 'Islamic Studies', 
        qual: { degree: 'PhD Islamic Studies', institution: 'IIUI' } 
      },
      { 
        count: 5, 
        dept: 'English', 
        spec: 'English Literature', 
        qual: { degree: 'PhD English', institution: 'NUML' } 
      },
      { 
        count: 2, 
        dept: 'Pakistan Studies', 
        spec: 'Pakistan Studies', 
        qual: { degree: 'PhD Pakistan Studies', institution: 'QAU' } 
      },
      { 
        count: 3, 
        dept: 'Physics', 
        spec: 'Physics', 
        qual: { degree: 'PhD Physics', institution: 'PU' } 
      },
      { 
        count: 32, 
        dept: ['Computer Science', 'Software Engineering', 'Information Technology'], 
        spec: 'Computer Science', 
        qual: { degree: 'PhD Computer Science', institution: 'LUMS' } 
      }
    ];

    const designations = ['Lecturer', 'Assistant Professor', 'Associate Professor', 'Professor'];

    for (const group of facultyGroups) {
      for (let i = 0; i < group.count; i++) {
        if (nameIndex >= realNames.length) nameIndex = 0; // Cycle names if needed
        
        const name = realNames[nameIndex++];
        const nameSlug = name.toLowerCase().replace(/\s+/g, '.');
        
        // Handle Dept (Single string or Array cycle)
        let dept = group.dept;
        if (Array.isArray(group.dept)) {
          dept = group.dept[i % group.dept.length];
        }

        const designation = designations[i % 4];
        
        // Create User
        // Ensure unique email by appending count if needed, or just use count to be safe
        // Or better, check if name has been used? 
        // Simplest: Append count to email to guarantee uniqueness
        const user = await User.create({
          name: name,
          uniEmail: `${nameSlug}.${count + 1}.fac@uvap.edu.pk`, // Added count to ensure uniqueness
          personalEmail: `${nameSlug}.${count + 1}@gmail.com`,
          password: 'password123', 
          role: 'faculty',
          phone: `0300-${1000000 + count}`,
          isVerified: true
        });

        // Create Profile
        await FacultyProfile.create({
          user: user._id,
          employeeId: `FAC-${1000 + count}`,
          cnic: `35202-${1000000 + count}-1`,
          address: `House ${count + 1}, Street ${count + 1}, Lahore`,
          gender: count % 2 === 0 ? 'Male' : 'Female',
          dob: new Date(1980 + (count % 10), 0, 1),
          department: dept,
          designation: designation,
          salary: 50000 + (count * 1000),
          specialization: group.spec,
          experience: 5 + (count % 10),
          joiningDate: new Date(),
          qualifications: [group.qual],
          status: 'Active'
        });
        
        count++;
      }
    }

    console.log(`Successfully seeded ${count} faculty members.`);
    console.log('- 8 Mathematics');
    console.log('- 4 Islamic Studies');
    console.log('- 5 English');
    console.log('- 2 Pakistan Studies');
    console.log('- 3 Physics');
    console.log('- 32 CS/SE/IT');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected.');
    process.exit(0);
  }
};

seedFaculty();
