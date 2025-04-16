const express = require("express");
const router = express.Router();
const userController  = require("../controller/userController");
const mongoose = require('mongoose');

// router.get('/',userController.getAllUser);
// ROUTES CỤ THỂ — đặt TRƯỚC
router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/', userController.getAllUser);
router.post('/', userController.addUser);

// ROUTES CÓ THAM SỐ — đặt SAU CÙNG
router.post('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);
module.exports = router;
