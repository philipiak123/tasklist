// routes/authRoutes.js

const express = require('express');
const { registerUser, verifyUser, loginUser, getUserData, toggleDarkMode, forgotPassword, resetPassword, changePassword } = require('../controllers/authController');

const router = express.Router();

router.post('/register', registerUser);

router.get('/verify/:verificationCode', verifyUser);
router.post('/login', loginUser);
router.get('/data', getUserData); 
router.patch('/darkmode', toggleDarkMode); 
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.patch('/change-password', changePassword);

module.exports = router;
