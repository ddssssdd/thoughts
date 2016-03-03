var express = require("express");
var router = express.Router();
router.get("/index1",function(req,res){
	res.render("test/index_1");
});

router.get("/promise",function(req,res){
	require("../common/spider").update_feeds(res.json);
});

module.exports = router;