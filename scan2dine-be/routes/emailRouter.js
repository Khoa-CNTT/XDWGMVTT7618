// routes/emailRoutes.js
const express = require('express');
const router = express.Router();
const emailController = require('../controller/emailController');

// Định nghĩa route để lấy email mới
router.get('/email', emailController.getLatestEmail);

module.exports = router;
