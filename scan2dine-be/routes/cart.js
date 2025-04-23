var express = require('express');
var router = express.Router();
const cartController = require("../controller/cartController");
router.get('/', cartController.getCart);
router.get('/:id', cartController.getAcart);
router.delete('/:id', cartController.deleteCartdetail);
router.post('/confirm', cartController.createOrderFromCart);

module.exports =router;
