const db = require('../config/db'); 

const addTask = (listId, description) => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO tasks (list_id, description) VALUES (?, ?)';
    db.query(sql, [listId, description], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

const deleteTask = (taskId) => {
  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM tasks WHERE id = ?';
    db.query(sql, [taskId,], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

const updateTaskDescription = (taskId, newDescription) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE tasks SET description = ? WHERE id = ?';
    db.query(sql, [newDescription, taskId], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

const getUserTasks = (userId, listId) => {
  return new Promise((resolve, reject) => {
    const checkOwnerSql = 'SELECT * FROM lists WHERE id = ? AND user_id = ? LIMIT 1';
    db.query(checkOwnerSql, [listId, userId], (err, results) => {
      if (err) return reject(err);
      if (results.length === 0) {
        return reject(new Error('Unauthorized: list does not belong to user'));
      }

      const getTasksSql = 'SELECT * FROM tasks WHERE list_id = ?';
      db.query(getTasksSql, [listId], (err2, tasks) => {
        if (err2) return reject(err2);
        resolve(tasks);
      });
    });
  });
};


const toggleTaskChecked = (taskId) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE tasks SET checked = NOT checked WHERE id = ?';
    db.query(sql, [taskId], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

module.exports = {
  addTask,
  deleteTask,
  updateTaskDescription,
  getUserTasks,
  toggleTaskChecked, 
};

