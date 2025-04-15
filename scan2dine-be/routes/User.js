const express = require("express");
const router = express.Router();
const userController  = require("../controller/userController");

router.get('/',userController.getAllUser);
router.post('/',userController.addUser);
router.delete('/:id',userController.deleteUser);
router.post('/:id',userController.updateUser);
module.exports = router;