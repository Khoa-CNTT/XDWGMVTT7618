var express = require("express");
var router = express.Router();
const customerController = require("../controller/customerController");


// ADD CUSTOMNER
router.post("/", customerController.addCustomer);
// ALL CUSTOMER
router.get("/", customerController.getAllCustomer);
//Show all khách hàng đã mua hàng
router.get("/static", customerController.getCustomerStatistics)
// UPDATE CUSTOMER
router.patch('/:id', customerController.updateCustomer);
//DELETE CUSTOMER
router.delete('/:id', customerController.deleteCustomer);
//Check Phone
router.post("/check-phone", customerController.checkCustomerByPhone);

module.exports = router;
