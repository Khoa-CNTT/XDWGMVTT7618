var express = require('express');
const tableController = require('../controller/tableController');
var router = express.Router();


router.get('/', tableController.getTable);
router.post('/', tableController.addTable);
router.delete('/:id', tableController.deleteTable);


module.exports = router;