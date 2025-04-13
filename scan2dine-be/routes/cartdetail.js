var express = require('express');
const cartdetailCoontroller = require('../controller/cartdetailController');
var router = express.Router();

router.post('/', cartdetailCoontroller.addCartdetail);
router.get('/', cartdetailCoontroller.getCartdetail)
router.delete('/:id', cartdetailCoontroller.deleteCartdetai);
router.patch('/:id', cartdetailCoontroller.updateCartdetail);
module.exports = router;