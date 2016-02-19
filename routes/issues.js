var express = require("express");
var router = express.Router();

router.post("/add",function(req,res){
	var m = require("mongoose");
	var Issue = m.model("project_issues");
	Issue.add(req.body.owner,
		req.body.title,
		req.body.description,
		req.body.status || 'new',
		req.session.user.id,
		function(items){
			res.json(items);
	});
});

module.exports = router;