const express = require('express');
const router = express.Router();
const {
  protect,
  auditorOnly,
  adminOnly,
  AdminandAuditorOnly,
  verifiedOnly,
} = require('../middleware/authMiddleware');

const {
  addResource,
  getResource,
  getAllUserResources,
  getAllResources,
} = require('../controllers/resourceController');

router.post('/addResource', protect, addResource);
router.get('/Resource/:res_id', protect, getResource);
router.get('/', protect, getAllUserResources);
router.get('/allResources', protect, getAllResources);

module.exports = router;
