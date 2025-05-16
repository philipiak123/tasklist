const db = require('../config/db'); // Załaduj konfigurację bazy danych

// Funkcja dodająca token do czarnej listy
const addTokenToBlacklist = (token) => {
  return new Promise((resolve, reject) => {
    const query = 'INSERT INTO blacklisted_tokens (token) VALUES (?)';
    db.query(query, [token], (err, result) => {
      if (err) {
        return reject(new Error('Failed to blacklist token'));
      }
      resolve(result);
    });
  });
};

// Funkcja sprawdzająca, czy token znajduje się na czarnej liście
const isTokenBlacklisted = (token) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM blacklisted_tokens WHERE token = ?';
    db.query(query, [token], (err, result) => {
      if (err) {
        return reject(new Error('Failed to check token'));
      }

      if (result.length > 0) {
        // Token znajduje się na czarnej liście
        resolve(true);
      } else {
        // Token nie znajduje się na czarnej liście
        resolve(false);
      }
    });
  });
};

module.exports = { addTokenToBlacklist, isTokenBlacklisted };
