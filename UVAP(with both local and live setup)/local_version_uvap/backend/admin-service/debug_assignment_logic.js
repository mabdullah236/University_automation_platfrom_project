console.log('Debug Script Process Started...');
const mongoose = require('mongoose');
const User = require('./src/models/User');
const FacultyProfile = require('./src/models/FacultyProfile');
const CourseAllocation = require('./src/models/CourseAllocation');
const Course = require('./src/models/Course');
const allocationService = require('./src/services/allocationService');
const fs = require('fs');

const MONGO_URI = 'mongodb://127.0.0.1:27017/uvap_local';

const log = (msg) => {
  console.log(msg);
  fs.appendFileSync('debug_assignment_output.txt', msg + '\n');
};

const run = async () => {
  try {
    fs.writeFileSync('debug_assignment_output.txt', 'Starting Assignment Debug...\n');
    await mongoose.connect(MONGO_URI);
    log('Connected to DB');

    // 1. Find the unassigned "Programming Fundamentals" allocation
    // We'll search by course title pattern since we don't have the ID
    const courses = await Course.find({ title: /Programming Fundamentals/i });
    if (courses.length === 0) {
        log('Error: Course "Programming Fundamentals" not found.');
        return;
    }
    const courseIds = courses.map(c => c._id);
    
    const unassigned = await CourseAllocation.findOne({ 
        course: { $in: courseIds },
        teacher: null 
    }).populate('course');

    if (!unassigned) {
        log('No unassigned "Programming Fundamentals" allocation found.');
        return;
    }

    log(`Analyzing Unassigned Allocation: ${unassigned.course.title} (${unassigned.section})`);

    // 2. Fetch all active faculty
    const faculty = await FacultyProfile.find({ status: 'Active' }).populate('user');
    log(`Found ${faculty.length} active faculty members.`);

    // 3. Calculate Load for everyone
    const allAllocations = await CourseAllocation.find({ batch: unassigned.batch });
    const teacherLoadMap = {};
    allAllocations.forEach(a => {
        if (a.teacher) {
            const tid = a.teacher.toString();
            teacherLoadMap[tid] = (teacherLoadMap[tid] || 0) + 1;
        }
    });

    // 4. Score each teacher
    log('\n--- Scoring Analysis ---');
    for (const f of faculty) {
        const currentLoad = teacherLoadMap[f.user._id.toString()] || 0;
        // We need to access the internal calculateScore function or replicate it
        // Since it's not exported directly, we'll replicate the logic here for debugging
        // OR we can modify the service to export it. 
        // Let's replicate the key parts here to see what's happening.
        
        let score = 0;
        const maxLoad = 6;
        
        // 1. Specialization/Keyword Match
        const keywords = [
            f.specialization, 
            f.department, 
            ...(f.qualifications?.map(q => q.degree) || [])
        ].join(' ').toLowerCase();
        
        const title = unassigned.course.title.toLowerCase();
        const code = unassigned.course.code.toLowerCase();
        
        if (keywords.includes('computer') || keywords.includes('software') || keywords.includes('programming')) {
             // General CS match
        }

        // Replicating service logic roughly:
        const isCsCourse = title.includes('computer') || title.includes('programming') || title.includes('software') || title.includes('data') || code.startsWith('cs') || code.startsWith('se');
        const hasCsSpec = keywords.includes('computer') || keywords.includes('software') || keywords.includes('ai') || keywords.includes('data') || keywords.includes('web');

        if (title.split(' ').some(word => keywords.includes(word) && word.length > 3)) {
            score += 30;
        }
        if (isCsCourse && hasCsSpec) score += 50;
        if (f.department === unassigned.course.department) {
            score += 50;
        }

        // Load Penalty
        let loadScore = 0;
        if (currentLoad >= maxLoad) {
            loadScore = -1000;
        } else {
            loadScore = (maxLoad - currentLoad) * 10;
        }
        
        const totalScore = score + loadScore;

        log(`Teacher: ${f.user.name} | Dept: ${f.department} | Spec: ${f.specialization} | Load: ${currentLoad}/${maxLoad}`);
        log(`   - Base Score: ${score} | Load Score: ${loadScore} | Total: ${totalScore}`);
        
        if (totalScore > 0) {
            log(`   >>> CANDIDATE (Score > 0)`);
        }
    }

  } catch (err) {
    log('ERROR: ' + err.message);
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
};

run();
