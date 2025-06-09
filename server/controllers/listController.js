const listService = require('../services/listService');

const addList = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const { name } = req.body;

  if (!name) return res.status(400).json({ message: 'Name is required' });

  try {
    await listService.addList(token, name);
    res.status(201).json({ message: 'List added successfully' });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

const deleteList = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const { id } = req.params;

  try {
    await listService.deleteList(token, id);
    res.status(200).json({ message: 'List deleted successfully' });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

const updateListName = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const { id } = req.params;
  const { newName } = req.body;

  if (!newName) return res.status(400).json({ message: 'New name is required' });

  try {
    await listService.updateListName(token, id, newName);
    res.status(200).json({ message: 'List name updated successfully' });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

const getUserLists = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  try {
    const lists = await listService.getUserLists(token);
    res.status(200).json(lists);
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

module.exports = {
  addList,
  deleteList,
  updateListName,
  getUserLists,
};
