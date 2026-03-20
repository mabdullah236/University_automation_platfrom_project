const mongoose = require('mongoose');
const Room = require('./src/models/Room');

const checkRooms = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/uvap_local');
    console.log('Connected to DB');

    const rooms = await Room.find();
    console.log('Total Rooms:', rooms.length);
    
    const types = {};
    rooms.forEach(r => {
        types[r.type] = (types[r.type] || 0) + 1;
    });
    console.log('Room Types:', types);

    console.log('Sample Rooms:', rooms.map(r => ({ number: r.roomNumber, type: r.type })));

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkRooms();
