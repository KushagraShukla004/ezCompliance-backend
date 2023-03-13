const express = require('express');
const router = express.Router();
const {
  protect,
  auditorOnly,
  adminOnly,
  AdminandAuditorOnly,
  verifiedOnly,
} = require('../middleWare/authMiddleware.js');

const {
  createForm,
  getAllFormsofUser,
  getFormById,
  deleteForm,
  editForm,
  submitResponse,
  getAllResponses,
  getResponse,
  getAllForms,
} = require('../controllers/formController');

//Form Routes
router.post('/createForm', protect, auditorOnly, createForm);
router.get('/allForms', protect, AdminandAuditorOnly, getAllForms);
router.get('/', protect, auditorOnly, getAllFormsofUser);
router.get('/form/:formId', protect, getFormById);
router.delete('/deleteForm/:formId', protect, auditorOnly, deleteForm);
router.patch('/editForm/:formId', protect, auditorOnly, editForm);

//Response Routes
router.post('/addResponse', protect, submitResponse);
router.get('/Responses', protect, AdminandAuditorOnly, getAllResponses);
router.get('/getResponse/:formId', protect, AdminandAuditorOnly, getResponse);

module.exports = router;
