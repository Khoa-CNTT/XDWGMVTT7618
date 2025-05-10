var express = require('express');
const orderdetailCOntroller = require('../controller/orderdetailController');
var router  = express.Router();

router.get('/', orderdetailCOntroller.getOrderdetail);
router.post('/', orderdetailCOntroller.addOrderdetail);
router.delete('/:id', orderdetailCOntroller.deleteOrderdetail);
router.delete('/', orderdetailCOntroller.downQuantity);
router.patch('/:id', orderdetailCOntroller.updateOrderdetial); // Sử dụng phương thức PUT cho updat

// quyền làm
router.patch('/update1/:id', orderdetailCOntroller.updateOrderDetail);

// cập nhật trạng thái chi tiết đơn hàng
router.patch('/newStatus/:orderdetail', orderdetailCOntroller.updateOrderdetailStatus); 
// cập nhật trạng thái orderdetail xác nhận -> đang chuẩn bị
// req.params : id orderdetail - req.body: id order , newStatus
router.patch('/confirm/prepare/:orderdetail', orderdetailCOntroller.confirmStatus3); 
// cập nhật trạng thái orderdetail đang chuẩn bị -> hoàn thành
// req.params : id orderdetail - req.body: id order , newStatus
router.patch('/confirm/complete/:orderdetail', orderdetailCOntroller.confirmStatusComplete); 
module.exports = router;