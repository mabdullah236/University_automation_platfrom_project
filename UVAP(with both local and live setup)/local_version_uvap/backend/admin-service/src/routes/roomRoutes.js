const express = require('express');
const {
  addRoom,
  getAllRooms,
  updateRoom,
  deleteRoom
} = require('../controllers/roomController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router
  .route('/')
  .post(addRoom)
  .get(getAllRooms);

router
  .route('/:id')
  .put(updateRoom)
  .delete(deleteRoom);

module.exports = router;
