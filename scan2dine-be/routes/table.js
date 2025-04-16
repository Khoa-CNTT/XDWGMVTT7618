var express = require('express');
const tableController = require('../controller/tableController');
var router = express.Router();

// show all 
router.get('/', tableController.getTable);

module.exports = router;