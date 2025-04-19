var express = require('express');
const cartdetailController = require('../controller/cartdetailController');
var router = express.Router();

router.post('/', cartdetailController.addCartdetail);
router.get('/', cartdetailController.getCartdetail)
router.delete('/:id', cartdetailController.deleteCartdetai);
router.patch('/:id', cartdetailController.updateCartdetail);

module.exports = router;