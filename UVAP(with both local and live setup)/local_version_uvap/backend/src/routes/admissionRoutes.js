const express = require('express');
const multer = require('multer');
const path = require('path');
const { submitApplication, getApplications, updateApplicationStatus, deleteAdmission } = require('../controllers/admissionController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Configure Multer Storage
const fs = require('fs');


const uploadDir = path.join(__dirname, '../../uploads'); // Go up to backend root
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}
console.log('Upload Directory:', uploadDir);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Images and PDFs Only!');
    }
  }
});

// Define file fields
const uploadFields = upload.fields([
  { name: 'cnicFront', maxCount: 1 },
  { name: 'cnicBack', maxCount: 1 },
  { name: 'matricTranscript', maxCount: 1 },
  { name: 'interTranscript', maxCount: 1 }
]);

router.route('/')
  .post(uploadFields, submitApplication)
  .get(protect, authorize('admin'), getApplications);

router.route('/:id')
  .put(protect, authorize('admin'), updateApplicationStatus)
  .delete(protect, authorize('admin'), deleteAdmission);

module.exports = router;
