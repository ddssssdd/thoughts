var express = require("express");
var router = express.Router();
router.get("/index1",function(req,res){
	res.render("test/index_1");
})
module.exports = router;