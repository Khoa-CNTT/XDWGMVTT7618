const express = require("express");
const router = express.Router();
const foodstallController = require("../controller/foodstallController");

// router.get("/", foodstallController.getAllFoodstall); 
router.get('/', foodstallController.getAllFoodstall);
router.post("/", foodstallController.addFoodstall); 
router.delete("/:id", foodstallController.deleteFoodstall);
router.put("/:id", foodstallController.updateFoodstall);
module.exports = router;