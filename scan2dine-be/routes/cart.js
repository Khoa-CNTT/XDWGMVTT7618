var express = require('express');
var router = express.Router();
const cartController = require("../controller/cartController");
// add a cart
// router.post("/",cartController.addCart);

// show all 
router.get('/', cartController.getCart);
router.delete('/:id', cartController.deleteCartdetail);


module.exports =router;