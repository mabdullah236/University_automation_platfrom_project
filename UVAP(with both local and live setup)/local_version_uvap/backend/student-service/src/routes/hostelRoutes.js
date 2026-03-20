const express = require('express');
const {
  getHostels,
  createHostel,
  updateHostel,
  deleteHostel,
} = require('../controllers/hostelController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.route('/')
  .get(getHostels)
  .post(createHostel);

router.route('/:id')
  .put(updateHostel)
  .delete(deleteHostel);

module.exports = router;
