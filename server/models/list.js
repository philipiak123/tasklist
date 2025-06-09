const db = require('../config/db'); 

const addList = (userId, name) => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO lists (user_id, name) VALUES (?, ?)';
    db.query(sql, [userId, name], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

const deleteList = (listId, userId) => {
  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM lists WHERE id = ? AND user_id = ?';
    db.query(sql, [listId, userId], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

const updateListName = (listId, userId, newName) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE lists SET name = ? WHERE id = ? AND user_id = ?';
    db.query(sql, [newName, listId, userId], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

const getUserLists = (userId) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM lists WHERE user_id = ? ORDER BY date DESC';
    db.query(sql, [userId], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

module.exports = {
  addList,
  deleteList,
  updateListName,
  getUserLists,
};
