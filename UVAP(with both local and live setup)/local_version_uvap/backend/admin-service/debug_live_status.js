const mongoose = require('mongoose');
const Timetable = require('./src/models/Timetable');
const CourseAllocation = require('./src/models/CourseAllocation');
const Course = require('./src/models/Course');
const User = require('./src/models/User'); // Register User model

const MONGO_URI = 'mongodb://localhost:27017/uvap_local';

const run = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to DB');

        // 1. Get all ICT Allocations
        const allocations = await CourseAllocation.find()
            .populate('course')
            .populate('teacher');
        
        const ictAllocations = allocations.filter(a => a.course && a.course.title.includes('ICT'));
        
        console.log(`\nFound ${ictAllocations.length} ICT Allocations.`);

        for (const alloc of ictAllocations) {
            const sectionKey = `${alloc.program} ${alloc.semester} ${alloc.section}`;
            
            // 2. Count slots for this allocation
            const slots = await Timetable.find({ allocationId: alloc._id });
            
            console.log(`\n[${sectionKey}] Teacher: ${alloc.teacher?.name || 'Unassigned'}`);
            console.log(`   Target Slots: 3`);
            console.log(`   Actual Slots: ${slots.length}`);
            
            if (slots.length < 3) {
                console.log(`   !!! MISSING SLOTS !!!`);
            }

            slots.forEach(s => {
                console.log(`   - ${s.day} ${s.startTime} (${s.roomNumber})`);
            });
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

run();
