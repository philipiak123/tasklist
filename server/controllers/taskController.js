const taskService = require('../services/taskService');

const addTask = async (req, res) => {
  const authHeader = req.headers.authorization;
  const { listId, description } = req.body;
  const token = req.headers.authorization?.split(' ')[1];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token' });
  }

  if (!listId || !description) {
    return res.status(400).json({ message: 'List ID and task are required' });
  }

  try {
    await taskService.addTask(token, listId, description);
    res.status(201).json({ message: 'Task added successfuly' });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

const deleteTask = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const { id } = req.params;

  try {
    await taskService.deleteTask(token, id);
    res.status(200).json({ message: 'Task deleted' });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

const updateTaskDescription = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const { id } = req.params;
  const { newDescription } = req.body;

  if (!newDescription) {
    return res.status(400).json({ message: 'Task is required' });
  }

  try {
    await taskService.updateTaskDescription(token, id, newDescription);
    res.status(200).json({ message: 'Successful change' });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

const getTasks = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const { listId } = req.params;

  try {
    const tasks = await taskService.getUserTasks(token, listId);
    res.status(200).json(tasks);
  } catch (err) {
    console.error('Error fetching tasks:', err); 
    res.status(500).json({ message: 'Internal server error' });
  }
};

const toggleTaskChecked = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const { id } = req.params;

  try {
    await taskService.toggleTaskChecked(token, id);
    res.status(200).json({ message: 'Changed' });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

module.exports = {
  addTask,
  deleteTask,
  updateTaskDescription,
  getTasks,
  toggleTaskChecked, 
};
