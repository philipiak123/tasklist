const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

// POST /tasks/add
router.post('/add', taskController.addTask);

// DELETE /tasks/delete/:id
router.delete('/delete/:id', taskController.deleteTask);

// PUT /tasks/edit/:id
router.put('/edit/:id', taskController.updateTaskDescription);

// GET /tasks/:listId
router.get('/:listId', taskController.getTasks);
router.patch('/toggle/:id', taskController.toggleTaskChecked);

module.exports = router;
