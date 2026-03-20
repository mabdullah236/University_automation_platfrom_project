const express = require('express');
const { uploadMaterial, getMaterialsByCourse } = require('../controllers/lmsController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(protect);

router.post('/upload', authorize('faculty'), upload.single('file'), uploadMaterial);
router.get('/course/:courseId', getMaterialsByCourse);

module.exports = router;
