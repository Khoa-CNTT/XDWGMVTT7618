var express = require('express');
const tableController = require('../controller/tableController');
var router = express.Router();

router.get('/', tableController.getTable);
router.post('/', tableController.addTable);
router.delete('/:id', tableController.deleteTable);
router.patch('/:id', tableController.updatetable);
router.get('/current/:id', tableController.getCurrentOrderByTable);
router.delete('/status/:id', tableController.deleteTableById);

module.exports = router;