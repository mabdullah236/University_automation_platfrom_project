const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, 'src/config/config.env') });

const CourseAllocation = require('./src/models/CourseAllocation');
const Course = require('./src/models/Course');
const StudentProfile = require('./src/models/StudentProfile');
const FacultyProfile = require('./src/models/FacultyProfile');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

const debugAutoAssign = async () => {
  await connectDB();

  const batch = 'TEST-2025'; // Hardcoded based on screenshot
  console.log(`\n--- Debugging Auto-Assign for Batch: ${batch} ---\n`);

  // 1. Check Existing Allocations
  const existingAllocations = await CourseAllocation.find({ batch }).populate('course');
  console.log(`1. Existing Allocations found: ${existingAllocations.length}`);

  const activeScopes = new Set();
  existingAllocations.forEach(a => {
    if (a.program && a.semester) {
      activeScopes.add(`${a.program}|${a.semester}`);
    }
  });
  console.log(`   Active Scopes from Allocations:`, Array.from(activeScopes));

  // 2. Check Student Profiles (Fallback)
  if (activeScopes.size === 0) {
    console.log('   -> No scopes from allocations. Checking Students...');
    const students = await StudentProfile.find({ batch });
    console.log(`   -> Found ${students.length} students in batch ${batch}`);
    
    students.forEach(s => {
      if (s.program && s.currentSemester) {
        activeScopes.add(`${s.program}|${s.currentSemester}`);
      }
    });
    console.log(`   -> Active Scopes after Student check:`, Array.from(activeScopes));
  }

  // 3. Iterate Scopes
  for (const scope of activeScopes) {
    const [program, semesterStr] = scope.split('|');
    const semester = parseInt(semesterStr);
    console.log(`\n   [Scope: ${program} - Semester ${semester}]`);

    // Find Courses
    const courses = await Course.find({ program, semester });
    console.log(`   -> Courses found: ${courses.length}`);
    courses.forEach(c => console.log(`      - ${c.code}: ${c.title}`));

    // Find Sections
    const sectionsInScope = new Set();
    existingAllocations
        .filter(a => a.program === program && a.semester === semester)
        .forEach(a => sectionsInScope.add(a.section));
    
    console.log(`   -> Sections from Allocations:`, Array.from(sectionsInScope));

    if (sectionsInScope.size === 0) {
        console.log('      -> No sections from allocations. Checking Students...');
        const students = await StudentProfile.find({ batch, program, currentSemester: semester });
        console.log(`      -> Found ${students.length} students in this scope`);
        
        students.forEach(s => {
            if (s.section) sectionsInScope.add(s.section);
            else console.log(`         Warning: Student ${s.studentId} has NO SECTION`);
        });
        console.log(`      -> Sections after Student check:`, Array.from(sectionsInScope));
    }

    // Simulate Assignment Loop
    for (const course of courses) {
        for (const section of sectionsInScope) {
            console.log(`      Checking: ${course.code} - ${section}`);
            let allocation = await CourseAllocation.findOne({
                batch,
                course: course._id,
                section
            });

            if (!allocation) {
                console.log(`      -> Allocation MISSING. Would create new.`);
            } else if (!allocation.teacher) {
                console.log(`      -> Allocation exists but UNASSIGNED. Would assign.`);
            } else {
                console.log(`      -> Allocation exists and assigned to ${allocation.teacher}`);
            }
        }
    }
  }

  process.exit();
};

debugAutoAssign();
