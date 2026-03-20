const express = require('express');
const {
  getInventory,
  addItem,
  updateItem,
  deleteItem,
} = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.route('/')
  .get(getInventory)
  .post(addItem);

router.route('/:id')
  .put(updateItem)
  .delete(deleteItem);

module.exports = router;
