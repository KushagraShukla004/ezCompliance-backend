const express = require("express");
const {
  addCategory,
  getAllCategories,
  editCategory,
  deleteCategory,
} = require("../controllers/categoryController");
const router = express.Router();
const {
  protect,
  adminOnly,
  verifiedOnly,
  AdminandAuditorOnly,
} = require("../middleware/authMiddleware");

router.post("/", protect, verifiedOnly, adminOnly, addCategory);
router.get("/", protect, verifiedOnly, AdminandAuditorOnly, getAllCategories);
router.delete("/:cat_id", protect, verifiedOnly, adminOnly, deleteCategory);
router.patch("/", protect, verifiedOnly, adminOnly, editCategory);

module.exports = router;
