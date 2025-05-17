const jwt = require('jsonwebtoken');
const listModel = require('../models/list');

const secret = process.env.JWT_SECRET || 'your_jwt_secret';

const verifyToken = (token) => {
  try {
    return jwt.verify(token, secret);
  } catch (err) {
    throw new Error('Invalid token');
  }
};

const addList = async (token, name) => {
  const decoded = verifyToken(token);
  if (!decoded || !decoded.id) throw new Error('Unauthorized');
  
  const result = await listModel.addList(decoded.id, name);
  return result;
};

const deleteList = async (token, listId) => {
  const decoded = verifyToken(token);
  if (!decoded || !decoded.id) throw new Error('Unauthorized');

  const result = await listModel.deleteList(listId, decoded.id);
  if (result.affectedRows === 0) {
    throw new Error('List not found or not authorized');
  }
  return result;
};

const updateListName = async (token, listId, newName) => {
  const decoded = verifyToken(token);
  if (!decoded || !decoded.id) throw new Error('Unauthorized');

  const result = await listModel.updateListName(listId, decoded.id, newName);
  if (result.affectedRows === 0) {
    throw new Error('List not found or not authorized');
  }
  return result;
};

const getUserLists = async (token) => {
  const decoded = verifyToken(token);
  if (!decoded || !decoded.id) throw new Error('Unauthorized');

  const lists = await listModel.getUserLists(decoded.id);
  return lists;
};

module.exports = {
  addList,
  deleteList,
  updateListName,
  getUserLists,
};
