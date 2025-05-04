var express = require('express');
const zalo = require('../controller/paymentZalo');
var router = express.Router();

router.post('/zalopay', zalo.payment);
module.exports = router;
