const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('../models/user');
const { sendToQueue } = require('../config/rabbitmq');
const jwt = require('jsonwebtoken');
const { addTokenToBlacklist, isTokenBlacklisted } = require('../models/tokenblacklist'); // Załaduj model

// Register function
const register = async (email, password, callback) => {
  try {

    const existingUser = await new Promise((resolve, reject) => {
      User.getUserByEmail(email, (err, user) => {
        if (err) return reject(err);
        console.log(user);
        resolve(user);
      });
    });

    if (existingUser) {
      return callback({ message: 'Email is already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = crypto.randomBytes(20).toString('hex');

    User.registerUser(email, hashedPassword, verificationCode, (err, result) => {
      if (err) {
        return callback({ message: 'Registration error' });
      }

      const verificationLink = `http://localhost:5001/api/auth/verify/${verificationCode}`;

      const message = {
        to: email,
        subject: 'Verify your account',
        text: `Hello!\n\nClick this link to verify account: \n${verificationLink}\n\Thanks!`,
      };

      sendToQueue('emailQueue', message);

      return callback(null, result);
    });
  } catch (error) {
    console.error('Register error', error);
    return callback({ message: 'Internal server error' });
  }
};

const login = async (email, password, callback) => {

    User.getUserByEmail(email, async (err, user) => {
      if (err) return callback({ status: 500, message: 'Error fetching user' });
      if (!user) return callback({ status: 401, message: 'Invalid email or password' });
      if (!user.verified) return callback({ status: 403, message: 'Account not verified' });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return callback({ status: 401, message: 'Invalid email or password' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, darkMode: user.darkMode },
        process.env.JWT_SECRET || 'secret_key', 
        { expiresIn: '1h' }
      );

      callback(null, { token });
    });
};

const getUserData = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id); 

    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
      darkMode: user.darkMode,
    };
  } catch (err) {
    throw new Error('Invalid token');
  }
};

// Funkcja do przełączania trybu ciemnego
const toggleDarkMode = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Zmiana trybu ciemnego
    await User.toggleDarkMode(userId);

    return { message: 'Dark mode changed' };
  } catch (err) {
    throw new Error('Invalid token');
  }
};

const forgotPassword = async (email) => {
  const user = await new Promise((resolve, reject) => {
    User.getUserByEmail(email, (err, user) => {
      if (err) return reject(new Error('Database error'));
      if (!user) return reject(new Error('No user with that email'));
      resolve(user);
    });
  });

  const token = jwt.sign(
    { email: user.email },
    process.env.JWT_SECRET || 'secret_key',
    { expiresIn: '1h' }
  );

  const resetLink = `http://localhost:3001/reset-password/${token}`;

  const message = {
    to: user.email,
    subject: 'Password Reset Request',
    text: `Hi,\n\nClick below to reset your password:\n${resetLink}\n\nIf you didn't request this, just ignore it.`,
  };

  sendToQueue('emailQueue', message);
};

const resetPassword = async (token, newPassword) => {
  let decoded;
  
  // Sprawdzanie, czy token jest na czarnej liście
  const isBlacklisted = await isTokenBlacklisted(token);
  if (isBlacklisted) {
    throw new Error('This token has been blacklisted, password reset is not allowed');
  }

  // Sprawdzenie poprawności tokena
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
  } catch (err) {
    throw new Error('Invalid or expired token');
  }

  // Zaktualizowanie hasła użytkownika
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await new Promise((resolve, reject) => {
    User.updatePasswordByEmail(decoded.email, hashedPassword, (err, res) => {
      if (err) return reject(new Error('Failed to update password'));
      if (res.affectedRows === 0) return reject(new Error('User not found'));
      resolve();
    });
  });

  // Dodanie tokena do czarnej listy po pomyślnym zresetowaniu hasła
  await addTokenToBlacklist(token);
  console.log('Token added to blacklist');
};

const changePassword = async (token, currentPassword, newPassword) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found.');
    }

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      throw new Error('Current password is incorrect.');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await User.updatePassword(userId, hashedNewPassword);
  } catch (err) {
    throw err;
  }
};

module.exports = {
  register,
  login,
  getUserData,
  toggleDarkMode,
  forgotPassword,
  resetPassword,
  changePassword
};