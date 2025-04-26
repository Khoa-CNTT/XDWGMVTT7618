var express = require('express');
const orderdetailCOntroller = require('../controller/orderdetailController');
var router  = express.Router();

router.get('/', orderdetailCOntroller.getOrderdetail);
router.post('/', orderdetailCOntroller.addOrderdetail);
router.delete('/:id', orderdetailCOntroller.deleteOrderdetail);
router.delete('/', orderdetailCOntroller.downQuantity);
router.patch('/:id', orderdetailCOntroller.updateOrderdetial); // Sử dụng phương thức PUT cho updat
// cập nhật trạng thái chi tiết đơn hàng
router.patch('/newStatus/:orderdetail', orderdetailCOntroller.updateOrderdetailStatus); 
module.exports = router;