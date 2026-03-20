const Material = require('../models/Material');
const path = require('path');

// @desc    Upload course material
// @route   POST /api/v1/lms/upload
// @access  Private (Faculty)
exports.uploadMaterial = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    const { courseId, title, description } = req.body;

    // Construct file URL (assuming static serving is set up)
    const fileUrl = `/uploads/${req.file.filename}`;

    const material = await Material.create({
      course: courseId,
      title,
      description,
      fileUrl,
      uploadedBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      data: material,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get materials for a course
// @route   GET /api/v1/lms/course/:courseId
// @access  Private (Student, Faculty)
exports.getMaterialsByCourse = async (req, res, next) => {
  try {
    const materials = await Material.find({ course: req.params.courseId })
      .populate('uploadedBy', 'name')
      .sort({ uploadDate: -1 });

    res.status(200).json({
      success: true,
      count: materials.length,
      data: materials,
    });
  } catch (err) {
    next(err);
  }
};
