const jwt = require('jsonwebtoken');
const taskModel = require('../models/task');
const secret = process.env.JWT_SECRET || 'your_jwt_secret';

const verifyToken = (token) => {
  try {
    return jwt.verify(token, secret);
  } catch (err) {
    throw new Error('Token not valid');
  }
};

const addTask = async (token, listId, description) => {
  const decoded = verifyToken(token);
  if (!decoded || !decoded.id) throw new Error('Unauthorized');
  return await taskModel.addTask(listId, description);
};

const deleteTask = async (token, taskId) => {
  const decoded = verifyToken(token);
  if (!decoded || !decoded.id) throw new Error('Unauthorized');

  const result = await taskModel.deleteTask(taskId, decoded.id);
  if (result.affectedRows === 0) {
    throw new Error('Task doesn\'t exists');
  }
  return result;
};

const updateTaskDescription = async (token, taskId, newDescription) => {
  const decoded = verifyToken(token);
  if (!decoded || !decoded.id) throw new Error('Unauthorized');

  const result = await taskModel.updateTaskDescription(taskId, decoded.id, newDescription);
  if (result.affectedRows === 0) {
    throw new Error('Task doesn\'t exists');
  }
  return result;
};

const getUserTasks = async (token, listId) => {
  const decoded = verifyToken(token);
  if (!decoded || !decoded.id) throw new Error('Unauthorized');

  return await taskModel.getUserTasks(decoded.id, listId);
};

const toggleTaskChecked = async (token, taskId) => {
  const decoded = verifyToken(token);
  if (!decoded || !decoded.id) throw new Error('Unauthorized');

  return await taskModel.toggleTaskChecked(taskId);
};

module.exports = {
  addTask,
  deleteTask,
  updateTaskDescription,
  getUserTasks,
  toggleTaskChecked, 
};
