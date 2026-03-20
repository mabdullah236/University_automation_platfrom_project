const mongoose = require('mongoose');
const Department = require('./src/models/Department');
const CourseAllocation = require('./src/models/CourseAllocation');

const debugData = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/uvap_local');
    console.log('Connected to DB');

    const depts = await Department.find();
    console.log('Departments:', depts.map(d => ({ name: d.name, code: d.programCode })));

    const distinctPrograms = await CourseAllocation.distinct('program');
    console.log('Distinct Programs in Allocations:', distinctPrograms);

    const allocations = await CourseAllocation.find().limit(5);
    console.log('Sample Allocations:', allocations.map(a => ({ program: a.program, semester: a.semester, section: a.section })));

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

debugData();
