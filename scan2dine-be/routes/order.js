var express = require('express');
const orderController = require('../controller/orderController');
var router = express.Router();

// ADD ORDER
router.post('/', orderController.addOrder);
// GET ORDErr
router.get('/',orderController.getOrder);
// Lấy những đơn hàng đã thanh toán
router.get('/dathanhtoan',orderController.getPaidOrdersDetail);

router.get('/:id',orderController.getAorder);

// DELETE ORDER
router.delete('/:id', orderController.deleteOrder);
// UPDATE ORDER
router.patch('/:id', orderController.updateOrder);

// update trạng thái tất cả chi tiết đơn hàng trong đơn hàng
// req: ID order
router.patch('/confirm-all/:id', orderController.confirmOrder);
// remove order status orderdetail  = chờ xác nhận
// req: id order
router.delete('/removestatus/:id', orderController.removeOrderdetailbyStatus);
module.exports = router;