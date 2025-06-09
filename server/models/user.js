// models/user.js

const db = require('../config/db');


const registerUser = (email, hashedPassword, verificationCode, callback) => {
  const query = `
    INSERT INTO users (email, password, verified, verificationCode)
    VALUES (?, ?, ?, ?)
  `;

  db.query(query, [email, hashedPassword, false, verificationCode], (err, result) => {
    if (err) {
      console.error('Error:', err);
      callback(err, null);
    } else {
      callback(null, result);
    }
  });
};

const getUserByEmail = (email, callback) => {
  const query = 'SELECT * FROM users WHERE email = ?';

  db.query(query, [email], (err, result) => {
    if (err) {
      console.error('Error:', err);
      callback(err, null);
    } else {
      if (result.length > 0) {
        callback(null, result[0]); 
      } else {
        callback(null, null); 
      }
    }
  });
};

const verifyUser = (verificationCode, callback) => {
  const query = 'UPDATE users SET verified = 1, verificationCode = NULL WHERE verificationCode = ?';
  db.query(query, [verificationCode], (err, result) => {
    if (err) {
      console.error('Error', err);
      callback(err, null);
    } else {
      callback(null, result);
    }
  });
};

const findById = (id) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM users WHERE id = ?';

    db.query(query, [id], (err, result) => {
      if (err) {
        reject(err); 
      } else if (result.length > 0) {
        resolve(result[0]); 
      } else {
        resolve(null); 
      }
    });
  });
};

const toggleDarkMode = (userId, callback) => {
  const query = 'UPDATE users SET darkMode = NOT darkMode WHERE id = ?';

  db.query(query, [userId], (err, result) => {
    if (typeof callback === 'function') {
      if (err) {
        console.error('Error:', err);
        callback(err, null);
      } else {
        callback(null, result);
      }
    } 
  });
};

const updatePasswordByEmail = (email, hashedPassword, callback) => {
  const query = 'UPDATE users SET password = ? WHERE email = ?';
  db.query(query, [hashedPassword, email], callback);
};

const updatePassword = (id, hashedPassword) => {
  return new Promise((resolve, reject) => {
    db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

module.exports = {
  getUserByEmail,
  registerUser,
  verifyUser,
  findById,
  toggleDarkMode,
  updatePasswordByEmail,
  updatePassword
};