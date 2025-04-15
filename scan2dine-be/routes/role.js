const express = require("express");
const router = express.Router();
const roleController  = require("../controller/roleController");

router.get('/',roleController.getRole);
router.post("/", roleController.AddRole); 

router.post("/:id", roleController.updateRole); 
router.delete("/:id", roleController.deleteRole); 
module.exports = router;