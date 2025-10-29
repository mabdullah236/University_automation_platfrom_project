
const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { getMyStudents, markAttendance } = require('../controllers/teacher.controller');
const validationMiddleware = require('../middleware/validationMiddleware');
const { markAttendanceSchema } = require('../validators/teacher.validator');

const router = express.Router();

router.use(protect, authorize('TEACHER'));

router.get('/students', getMyStudents);
router.post('/attendance', validationMiddleware(markAttendanceSchema), markAttendance);

module.exports = router;
