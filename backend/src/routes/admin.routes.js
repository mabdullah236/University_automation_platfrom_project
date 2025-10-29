
const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { getAllStudents, portalOverride } = require('../controllers/admin.controller');
const validationMiddleware = require('../middleware/validationMiddleware');
const { portalOverrideSchema } = require('../validators/admin.validator');

const router = express.Router();

// All routes in this file are protected and for admins only
router.use(protect, authorize('ADMIN'));

router.get('/students', getAllStudents);
router.post('/portal-override', validationMiddleware(portalOverrideSchema), portalOverride);

module.exports = router;
