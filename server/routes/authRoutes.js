// routes/authRoutes.js

const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/register', authController.registerUser);
router.get('/verify/:verificationCode', authController.verifyUser);
router.post('/login', authController.loginUser);
router.get('/data', authController.getUserData); 
router.patch('/darkmode', authController.toggleDarkMode); 
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.patch('/change-password', authController.changePassword);
router.post('/logout', authController.logoutUser);

module.exports = router;
