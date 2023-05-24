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
  createForm,
  getAllFormsofUser,
  getFormById,
  deleteForm,
  editForm,
  submitResponse,
  getAllResponseForms,
  getResponse,
  getAllForms,
} = require("../controllers/formController");

//Form Routes
router.post("/createForm", protect, adminOnly, createForm);
router.get("/allForms", protect, AdminandAuditorOnly, getAllForms);
router.get("/", protect, AdminandAuditorOnly, getAllFormsofUser);
router.get("/form/:formId", protect, getFormById);
router.delete("/deleteForm/:formId", protect, adminOnly, deleteForm);
router.patch("/editForm/:formId", protect, adminOnly, editForm);

//Response Routes
router.post("/addResponse", protect, auditorOnly, submitResponse);
router.get("/Responses", protect, AdminandAuditorOnly, getAllResponseForms);
router.get("/getResponse/:formId", protect, AdminandAuditorOnly, getResponse);

module.exports = router;
