const Transport = require('../models/Transport');

// @desc    Get all transport
// @route   GET /api/v1/transport
// @access  Private/Admin
exports.getTransport = async (req, res) => {
  try {
    const transport = await Transport.find();
    res.status(200).json({ success: true, count: transport.length, data: transport });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Create new transport
// @route   POST /api/v1/transport
// @access  Private/Admin
exports.createTransport = async (req, res) => {
  try {
    const transport = await Transport.create(req.body);
    res.status(201).json({ success: true, data: transport });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Update transport
// @route   PUT /api/v1/transport/:id
// @access  Private/Admin
exports.updateTransport = async (req, res) => {
  try {
    const transport = await Transport.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!transport) {
      return res.status(404).json({ success: false, message: 'Transport not found' });
    }

    res.status(200).json({ success: true, data: transport });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Delete transport
// @route   DELETE /api/v1/transport/:id
// @access  Private/Admin
exports.deleteTransport = async (req, res) => {
  try {
    const transport = await Transport.findByIdAndDelete(req.params.id);

    if (!transport) {
      return res.status(404).json({ success: false, message: 'Transport not found' });
    }

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
