var express = require('express');
const orderController = require('../controller/orderController');
var router = express.Router();

// ADD ORDER
router.post('/', orderController.addOrder);
// GET ORDErr
router.get('/',orderController.getOrder);
router.get('/:id',orderController.getAorder);

// DELETE ORDER
router.delete('/:id', orderController.deleteOrder);
// UPDATE ORDER
router.patch('/:id', orderController.updateOrder);

// update trạng thái tất cả chi tiết đơn hàng trong đơn hàng
// req: ID order
router.patch('/confirm-all/:id', orderController.confirmOrder);
module.exports = router;