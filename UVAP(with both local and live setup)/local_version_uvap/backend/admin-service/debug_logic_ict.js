const fs = require('fs');
const mongoose = require('mongoose');
const Course = require('./src/models/Course');
const CourseAllocation = require('./src/models/CourseAllocation');

const MONGO_URI = 'mongodb://localhost:27017/uvap_local';

const log = (msg) => {
    console.log(msg);
    fs.appendFileSync('debug_logic_output.txt', msg + '\n');
};

const checkLogic = async () => {
  try {
    fs.writeFileSync('debug_logic_output.txt', 'Starting Logic Debug...\n');
    await mongoose.connect(MONGO_URI);
    log('Connected to DB');

    const allocations = await CourseAllocation.find().populate('course');
    const ictAllocations = allocations.filter(a => a.course && a.course.title.includes('ICT'));

    log(`Found ${ictAllocations.length} allocations for ICT`);

    for (const allocation of ictAllocations) {
        const course = allocation.course;
        let slotsNeeded = 3; 
        const credits = parseInt(course.credits);
        
        if (!isNaN(credits)) {
            if (credits >= 3) slotsNeeded = 3;
            else if (credits <= 2) slotsNeeded = 1;
        }
        
        log(`Allocation: ${allocation.program} ${allocation.semester} ${allocation.section}`);
        log(`Course: ${course.title}, Credits: ${course.credits}, Parsed: ${credits}, SlotsNeeded: ${slotsNeeded}`);
        
        if (slotsNeeded !== 3) {
            log('!!! MISMATCH DETECTED !!!');
        }
    }

  } catch (err) {
    log('Error: ' + err.message);
  } finally {
    await mongoose.disconnect();
  }
};

checkLogic();
