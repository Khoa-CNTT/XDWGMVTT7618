const express = require('express');
const router = express.Router();
const vietqrController = require('../controller/vietqrController');

router.post('/generate-vietqr', vietqrController.generateQR);

module.exports = router;