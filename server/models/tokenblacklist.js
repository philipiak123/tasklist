const db = require('../config/db'); 

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

const isTokenBlacklisted = (token) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM blacklisted_tokens WHERE token = ?';
    db.query(query, [token], (err, result) => {
      if (err) {
        return reject(new Error('Failed to check token'));
      }

      if (result.length > 0) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
};

module.exports = { addTokenToBlacklist, isTokenBlacklisted };
