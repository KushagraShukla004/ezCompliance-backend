const express = require('express');
const router = express.Router();
const {
  protect,
  auditorOnly,
  adminOnly,
} = require('../middleware/authMiddleware');
const {
  registerUser,
  loginUser,
  logoutUser,
  getUser,
  loginStatus,
  updateUser,
  changePassword,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyUser,
  getUsers,
  deleteUser,
  upgradeUser,
  sendLoginCode,
  loginWithCode,
} = require('../controllers/userController');

router.post('/register', registerUser);
router.post('/sendVerificationEmail', protect, sendVerificationEmail);
router.patch('', verifyUser);
router.post('/login', loginUser);
router.get('/logout', logoutUser);
router.post('/sendLoginCode/:email', sendLoginCode);
router.post('/loginWithCode/:email', loginWithCode);

router.get('/getUser', protect, getUser);
router.get('/loginStatus', loginStatus);
router.patch('/updateUser', protect, updateUser);
router.patch('/changePassword', protect, changePassword);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:resetToken', resetPassword);

router.delete('/:id', protect, adminOnly, deleteUser);
router.get('/getUsers', protect, adminOnly, getUsers);
router.post('/upgrade', protect, adminOnly, upgradeUser);

module.exports = router;
