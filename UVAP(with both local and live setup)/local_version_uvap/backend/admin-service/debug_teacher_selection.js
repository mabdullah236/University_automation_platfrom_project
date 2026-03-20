const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, 'src/config/config.env') });

const Course = require('./src/models/Course');
const FacultyProfile = require('./src/models/FacultyProfile');
const CourseAllocation = require('./src/models/CourseAllocation');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// COPY OF LOGIC FROM allocationService.js
const calculateScore = (teacher, course, currentLoad, maxLoad = 6) => {
  let score = 0;

  // 1. Specialization/Keyword Match
  const keywords = [
    teacher.specialization, 
    teacher.department, 
    ...(teacher.qualifications?.map(q => q.degree) || [])
  ].join(' ').toLowerCase();
  
  const title = course.title.toLowerCase();
  const code = course.code.toLowerCase();
  
  const isCsCourse = title.includes('computer') || title.includes('programming') || title.includes('software') || title.includes('data') || code.startsWith('cs') || code.startsWith('se');
  const hasCsSpec = keywords.includes('computer') || keywords.includes('software') || keywords.includes('ai') || keywords.includes('data') || keywords.includes('web');

  if (title.split(' ').some(word => keywords.includes(word) && word.length > 3)) {
    score += 30;
  }

  if (isCsCourse && hasCsSpec) score += 50;

  // 2. Department Match (+100)
  if (teacher.department && course.department && teacher.department.toLowerCase() === course.department.toLowerCase()) {
    score += 100;
  } else {
      // Fuzzy match for department?
      if (teacher.department && course.department && teacher.department.toLowerCase().includes(course.department.toLowerCase())) {
          score += 80;
      }
  }

  // 3. Load Balancing
  if (currentLoad >= maxLoad) {
    score -= 1000; 
  } else {
    score += (maxLoad - currentLoad) * 10;
  }

  return { score, details: { isCsCourse, hasCsSpec, deptMatch: teacher.department === course.department, currentLoad } };
};

const debugSelection = async () => {
  await connectDB();

  // 1. Get a sample course
  const course = await Course.findOne({ code: { $regex: /CS|SE/i } }) || await Course.findOne();
  if (!course) {
      console.log('No courses found!');
      process.exit();
  }
  console.log(`\nDebugging for Course: ${course.code} - ${course.title} (${course.department})`);

  // 2. Get Faculty
  const faculty = await FacultyProfile.find({ status: 'Active' }).populate('user', 'name');
  console.log(`Found ${faculty.length} Active Faculty`);

  // 3. Mock Load
  const currentLoad = 0;

  console.log('\n--- Scoring Trace ---');
  for (const teacher of faculty) {
      const result = calculateScore(teacher, course, currentLoad);
      console.log(`\nTeacher: ${teacher.user.name}`);
      console.log(`  Dept: ${teacher.department}`);
      console.log(`  Spec: ${teacher.specialization}`);
      console.log(`  Score: ${result.score}`);
      console.log(`  Details:`, result.details);
  }

  process.exit();
};

debugSelection();
