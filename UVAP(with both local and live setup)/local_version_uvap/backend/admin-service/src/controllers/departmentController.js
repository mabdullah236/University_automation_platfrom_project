const Department = require('../models/Department');
const StudentProfile = require('../models/StudentProfile');
const FacultyProfile = require('../models/FacultyProfile');

// Add a new department
exports.addDepartment = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Department name is required' });
    }

    // Use provided shortName or generate (First letters of each word)
    const shortName = req.body.shortName 
      ? req.body.shortName.toUpperCase() 
      : name.split(' ').map(word => word[0]).join('').toUpperCase();

    // Use provided programCode or generate (BS + shortName)
    const programCode = req.body.programCode 
      ? req.body.programCode.toUpperCase() 
      : `BS${shortName}`;

    const existingDept = await Department.findOne({ 
      $or: [{ name }, { programCode }] 
    });

    if (existingDept) {
      return res.status(400).json({ message: 'Department or Program Code already exists' });
    }

    const newDepartment = new Department({
      name,
      shortName,
      programCode
    });

    await newDepartment.save();

    res.status(201).json({ 
      message: 'Department added successfully', 
      department: newDepartment 
    });

  } catch (error) {
    console.error('Error adding department:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all departments
exports.getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    res.status(200).json(departments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update a department
// Update a department
exports.updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, shortName, programCode } = req.body;

    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    // Check for duplicates (excluding current department)
    const duplicateCheck = await Department.findOne({
      $and: [
        { _id: { $ne: id } },
        { $or: [{ name }, { programCode }, { shortName }] }
      ]
    });

    if (duplicateCheck) {
      return res.status(400).json({ message: 'Department name, short name, or program code already exists' });
    }

    if (name) department.name = name;
    if (shortName) department.shortName = shortName.toUpperCase();
    
    // Update programCode if provided, otherwise regenerate if shortName changed
    if (programCode) {
      department.programCode = programCode.toUpperCase();
    } else if (shortName) {
      department.programCode = `BS${department.shortName}`;
    }

    await department.save();

    res.status(200).json({ 
      message: 'Department updated successfully', 
      department 
    });

  } catch (error) {
    console.error('Error updating department:', error);
    // Handle Mongoose duplicate key error specifically
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Duplicate field value entered' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a department
exports.deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    // Check for dependencies
    const studentCount = await StudentProfile.countDocuments({ 
      $or: [
        { program: department.programCode },
        { department: department.name }
      ]
    });

    const facultyCount = await FacultyProfile.countDocuments({ 
      department: department.name 
    });

    if (studentCount > 0 || facultyCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete department. It is linked to ${studentCount} students and ${facultyCount} faculty members.` 
      });
    }

    await Department.findByIdAndDelete(id);

    res.status(200).json({ message: 'Department deleted successfully' });

  } catch (error) {
    console.error('Error deleting department:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
