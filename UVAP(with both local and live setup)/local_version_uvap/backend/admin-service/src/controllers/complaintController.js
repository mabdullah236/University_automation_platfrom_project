const Complaint = require('../models/Complaint');

// @desc    Create a new complaint
// @route   POST /api/v1/complaints
// @access  Private (Student, Faculty)
exports.createComplaint = async (req, res, next) => {
  try {
    const { title, description, category } = req.body;

    const complaint = await Complaint.create({
      user: req.user.id,
      title,
      description,
      category,
    });

    res.status(201).json({
      success: true,
      data: complaint,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all complaints
// @route   GET /api/v1/complaints
// @access  Private (Admin: All, Student/Faculty: Own)
exports.getAllComplaints = async (req, res, next) => {
  try {
    let complaints;

    if (req.user.role === 'admin') {
      complaints = await Complaint.find()
        .populate('user', 'name email role')
        .sort({ date: -1 });
    } else {
      complaints = await Complaint.find({ user: req.user.id })
        .sort({ date: -1 });
    }

    res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update complaint status
// @route   PUT /api/v1/complaints/:id
// @access  Private (Admin)
exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    let complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    complaint.status = status;
    await complaint.save();

    res.status(200).json({
      success: true,
      data: complaint,
    });
  } catch (err) {
    next(err);
  }
};
