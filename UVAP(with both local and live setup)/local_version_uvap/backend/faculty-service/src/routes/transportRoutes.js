const express = require('express');
const {
  getTransport,
  createTransport,
  updateTransport,
  deleteTransport,
} = require('../controllers/transportController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.route('/')
  .get(getTransport)
  .post(createTransport);

router.route('/:id')
  .put(updateTransport)
  .delete(deleteTransport);

module.exports = router;
