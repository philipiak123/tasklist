// models/user.js

const db = require('../config/db');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

// Funkcja do rejestracji użytkownika
const registerUser = (email, hashedPassword, verificationCode, callback) => {
  const query = `
    INSERT INTO users (email, password, verified, verificationCode)
    VALUES (?, ?, ?, ?)
  `;

  db.query(query, [email, hashedPassword, false, verificationCode], (err, result) => {
    if (err) {
      console.error('Błąd przy rejestracji użytkownika:', err);
      callback(err, null);
    } else {
      callback(null, result);
    }
  });
};

// Funkcja do sprawdzenia, czy użytkownik istnieje
const getUserByEmail = (email, callback) => {
  const query = 'SELECT * FROM users WHERE email = ?';

  db.query(query, [email], (err, result) => {
    if (err) {
      console.error('Błąd przy pobieraniu użytkownika:', err);
      callback(err, null);
    } else {
      if (result.length > 0) {
        callback(null, result[0]); // Zwracamy pierwszego użytkownika
      } else {
        callback(null, null); // Jeśli użytkownik nie istnieje
      }
    }
  });
};

// Funkcja do weryfikacji użytkownika
const verifyUser = (verificationCode, callback) => {
  const query = 'UPDATE users SET verified = 1, verificationCode = NULL WHERE verificationCode = ?';
  console.log(verificationCode);
  db.query(query, [verificationCode], (err, result) => {
    if (err) {
      console.error('Błąd przy weryfikacji użytkownika:', err);
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
        reject(err); // Od razu zwróć błąd, jeśli wystąpi
      } else if (result.length > 0) {
        resolve(result[0]); // Zwróć użytkownika, jeśli znaleziono
      } else {
        resolve(null); // Jeśli użytkownik nie został znaleziony
      }
    });
  });
};

const toggleDarkMode = (userId, callback) => {
  const query = 'UPDATE users SET darkMode = NOT darkMode WHERE id = ?';

  db.query(query, [userId], (err, result) => {
    if (typeof callback === 'function') {
      if (err) {
        console.error('Błąd przy zmianie trybu ciemnego:', err);
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