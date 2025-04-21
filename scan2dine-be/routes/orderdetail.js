var express = require('express');
const orderdetailCOntroller = require('../controller/orderdetailController');
var router  = express.Router();

router.get('/', orderdetailCOntroller.getOrderdetail);
router.post('/', orderdetailCOntroller.addOrderdetail);
router.delete('/:id', orderdetailCOntroller.deleteOrderdetail);
router.delete('/', orderdetailCOntroller.downQuantity);
router.patch('/:id', orderdetailCOntroller.updateOrderdetial); // Sử dụng phương thức PUT cho updat

module.exports = router;