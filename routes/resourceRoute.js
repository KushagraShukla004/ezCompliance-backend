const express = require("express");
const router = express.Router();
const {
  protect,
  auditorOnly,
  adminOnly,
  AdminandAuditorOnly,
  verifiedOnly,
} = require("../middleware/authMiddleware");

const {
  addResource,
  getResource,
  getAllUserResources,
  getAllResources,
} = require("../controllers/resourceController");

router.post("/addResource", protect, AdminandAuditorOnly, addResource);
router.get("/Resource/:res_id", protect, AdminandAuditorOnly, getResource);
router.get("/", protect, AdminandAuditorOnly, getAllUserResources);
router.get("/allResources", protect, AdminandAuditorOnly, getAllResources);

module.exports = router;
