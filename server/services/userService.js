const argon2 = require('argon2');
const crypto = require('crypto');
const User = require('../models/user');
const { sendToQueue } = require('../config/rabbitmq');
const jwt = require('jsonwebtoken');
const { addTokenToBlacklist, isTokenBlacklisted } = require('../models/tokenblacklist');

const register = async (email, password, callback) => {
  try {
    const existingUser = await new Promise((resolve, reject) => {
      User.getUserByEmail(email, (err, user) => {
        if (err) return reject(err);
        resolve(user);
      });
    });

    if (existingUser) {
      return callback({ message: 'Email is already in use' });
    }

    const hashedPassword = await argon2.hash(password, { type: argon2.argon2id });
    const verificationCode = crypto.randomBytes(20).toString('hex');

    User.registerUser(email, hashedPassword, verificationCode, (err, result) => {
      if (err) {
        return callback({ message: 'Registration error' });
      }

      const verificationLink = `http://localhost:5001/api/auth/verify/${verificationCode}`;

      const message = {
        to: email,
        subject: 'Verify your account',
        text: `Hello!\n\nClick this link to verify account: \n${verificationLink}\n\nThanks!`,
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

    const isMatch = await argon2.verify(user.password, password);
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
    const isBlacklistedToken = await isTokenBlacklisted(token);
    if (isBlacklistedToken) {
      throw new Error('Token is blacklisted');
    }

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
    throw new Error(err.message || 'Invalid token');
  }
};

const toggleDarkMode = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

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
  const isBlacklisted = await isTokenBlacklisted(token);
  if (isBlacklisted) {
    throw new Error('This token has been blacklisted, password reset is not allowed');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
  } catch (err) {
    throw new Error('Invalid or expired token');
  }

  const hashedPassword = await argon2.hash(newPassword, { type: argon2.argon2id });

  await new Promise((resolve, reject) => {
    User.updatePasswordByEmail(decoded.email, hashedPassword, (err, res) => {
      if (err) return reject(new Error('Failed to update password'));
      if (res.affectedRows === 0) return reject(new Error('User not found'));
      resolve();
    });
  });

  await addTokenToBlacklist(token);
};

const changePassword = async (token, currentPassword, newPassword) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found.');
    }

    const match = await argon2.verify(user.password, currentPassword);
    if (!match) {
      throw new Error('Current password is incorrect.');
    }

    const hashedNewPassword = await argon2.hash(newPassword, { type: argon2.argon2id });
    await User.updatePassword(userId, hashedNewPassword);
  } catch (err) {
    throw err;
  }
};

const logout = async (token) => {
  try {
    await addTokenToBlacklist(token);
  } catch (err) {
    throw new Error('Logout failed');
  }
};

module.exports = {
  register,
  login,
  getUserData,
  toggleDarkMode,
  forgotPassword,
  resetPassword,
  changePassword,
  logout
};
