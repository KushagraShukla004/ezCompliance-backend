const express = require('express');
const {
  addCategory,
  getAllCategories,
  editCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/', protect, adminOnly, addCategory);
router.get('/', protect, adminOnly, getAllCategories);
router.delete('/:cat_id', protect, adminOnly, deleteCategory);
router.patch('/', protect, adminOnly, editCategory);

module.exports = router;
