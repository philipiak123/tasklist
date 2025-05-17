const express = require('express');
const router = express.Router();
const listController = require('../controllers/listController');

router.post('/add', listController.addList);
router.delete('/:id', listController.deleteList);
router.patch('/:id', listController.updateListName);
router.get('/lists', listController.getUserLists);

module.exports = router;
