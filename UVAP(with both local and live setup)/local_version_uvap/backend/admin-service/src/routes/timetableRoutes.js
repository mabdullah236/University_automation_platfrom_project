const express = require('express');
const { 
    generateTimetable, 
    getTimetable, 
    updateTimetableSlot,
    getTimetableMetadata,
    clearTimetable
} = require('../controllers/timetableController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/generate', authorize('admin'), generateTimetable);
router.get('/', getTimetable);
router.get('/metadata', getTimetableMetadata);
router.put('/:id', authorize('admin'), updateTimetableSlot);
router.delete('/', authorize('admin'), clearTimetable);

module.exports = router;
