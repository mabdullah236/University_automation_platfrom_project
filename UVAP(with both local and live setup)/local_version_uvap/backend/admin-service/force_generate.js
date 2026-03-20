const mongoose = require('mongoose');
const { generateTimetable } = require('./src/controllers/timetableController');
const Timetable = require('./src/models/Timetable');
const Course = require('./src/models/Course');
const User = require('./src/models/User'); // Register User model

const MONGO_URI = 'mongodb://localhost:27017/uvap_local';

const mockReq = {
    body: {
        program: 'BSCS',
        semester: '1',
        section: 'M1'
    },
    user: { _id: 'mock_admin_id' } // In case it's needed
};

const mockRes = {
    status: (code) => ({
        json: (data) => {
            console.log(`Response [${code}]:`, JSON.stringify(data, null, 2));
        }
    })
};

const mockNext = (err) => {
    console.error('Next called with error:', err);
};

const run = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to DB');

        console.log('--- Generating Timetable for BSCS 1 M1 ---');
        await generateTimetable(mockReq, mockRes, mockNext);

        console.log('--- Checking Slots ---');
        const slots = await Timetable.find({ 
            program: 'BSCS',
            semester: '1',
            section: 'M1'
        }).populate('course');

        const ictSlots = slots.filter(s => s.course && s.course.title.includes('ICT'));
        console.log(`Found ${ictSlots.length} slots for ICT.`);
        ictSlots.forEach(s => {
            console.log(`Slot: ${s.day} ${s.startTime} - ${s.roomNumber}`);
        });

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
};

run();
