const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { sendToQueue } = require('../config/rabbitmq.js');
const crypto = require('crypto'); 
const userService = require('../services/userService');

const registerUser = (req, res) => {
  const { email, password } = req.body;

  userService.register(email, password, (err, result) => {
    if (err) {
      return res.status(400).json({ message: err.message || 'Register error' });
    }
    res.status(201).json({ message: 'Successful register. Please confirm your account on email' });
  });
};

const loginUser = (req, res) => {
  const { email, password } = req.body;

  userService.login(email, password, (err, result) => {
    if (err) {
      return res.status(err.status || 400).json({ message: err.message });
    }

    res.status(200).json({
      message: 'Login successful',
      token: result.token,
    });
  });
};

const verifyUser = (req, res) => {
  const { verificationCode } = req.params;
  console.log(verificationCode);
  User.verifyUser(verificationCode, (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Verification error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'You verify your account' });
  });
};

const getUserData = async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const userData = await userService.getUserData(token);
    res.status(200).json(userData);
  } catch (err) {
    console.error(err);
    res.status(403).json({ message: err.message });
  }
};

const toggleDarkMode = async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const result = await userService.toggleDarkMode(token);
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(403).json({ message: err.message });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    await userService.forgotPassword(email);
    res.status(200).json({ message: 'Reset link sent to your email.' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    await userService.resetPassword(token, newPassword);
    res.status(200).json({ message: 'Password has been changed.' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const changePassword = async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token' });
  }

  const token = authHeader.split(' ')[1];
  const { currentPassword, newPassword } = req.body;

  try {
    await userService.changePassword(token, currentPassword, newPassword);
    res.status(200).json({ message: 'Password has been changed.' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const logoutUser = async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    await userService.logout(token);
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


module.exports = {
  registerUser,
  loginUser,
  verifyUser,
  getUserData,
  toggleDarkMode,
  forgotPassword,
  resetPassword,
  changePassword,
  logoutUser
};