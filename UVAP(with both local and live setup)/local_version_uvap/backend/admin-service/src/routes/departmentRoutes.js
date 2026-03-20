const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Apply admin verification to all routes
router.use(protect);
router.use(authorize('admin'));

router.post('/', departmentController.addDepartment);
router.get('/', departmentController.getAllDepartments);
router.put('/:id', departmentController.updateDepartment);
router.delete('/:id', departmentController.deleteDepartment);

module.exports = router;
