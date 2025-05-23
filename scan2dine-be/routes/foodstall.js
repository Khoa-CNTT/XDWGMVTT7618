const express = require("express");
const router = express.Router();
const foodstallController = require("../controller/foodstallController");

// Specific routes with parameters should come first
router.get("/user/:userId", foodstallController.getFoodstallByUserId);
router.get("/search/:id", foodstallController.getFoodstallByTableNumber);


router.post("/numberofproduct", foodstallController.getNumberOfProduct);
// thống kê theo tháng và ngày
router.post("/month", foodstallController.getMonthlyRevenue);

router.get("/DayWeakMonth", foodstallController.getOrderStats);
// cho hiếu
router.post("/day", foodstallController.getStatisticByDateRange);

router.post("/thongkeCustomer", foodstallController.getStatisticByDateRange);
// router.post("/day", foodstallController.getStatisticByDateRange);
router.get("/thongkeCustomer", foodstallController.getStatisticByDateRange);
// thống kê dioanh thu tất cả các quầy 12 tháng trong năm
router.post("/thongkeall12month", foodstallController.getMonthlyRevenueAllStalls);
//
router.post("/inputMonthYear", foodstallController.getInputMonthYear);

router.get("/inputMonthYear", foodstallController.getInputMonthYear);
//
router.post("/thongkequay", foodstallController.getRevenueByStallInRange);
// thống kê các loại
router.post("/thongkeall", foodstallController.getStatistics113);
//
router.get("/allDoanhthu", foodstallController.getAllDoanhThu);
// 
router.get("/thongke", foodstallController.getStatistics);
//
router.get("/bestSeller", foodstallController.getDashboardStats);

// General routes
router.get("/", foodstallController.getAllFoodstall);

// CRUD operations
router.post("/", foodstallController.addFoodstall);
router.delete("/:id", foodstallController.deleteFoodstall);
router.put("/:id", foodstallController.updateFoodstall);

// Generic ID route should be last
router.get("/:id", foodstallController.getAStall);

// GET ORDER BY STALL ID
// req: ID stall
router.get('/orderstall/:id', foodstallController.getOrderDetailByStall);
module.exports = router;
