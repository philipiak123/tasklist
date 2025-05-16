const express = require('express');
const router = express.Router();
const listController = require('../controllers/listController');

router.post('/lists', listController.addList);
router.delete('/lists/:id', listController.deleteList);
router.patch('/lists/:id', listController.updateListName);
router.get('/lists', listController.getUserLists);

module.exports = router;
