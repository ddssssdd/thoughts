var express = require("express");
var router = express.Router();
router.get("/:code-:bref",function(req,res){
	res.render("issues/index",req.params)
});
router.post("/:code-:bref",function(req,res){
	var m = require("mongoose");
	var Issue = m.model("project_issues");
	var Project = m.model("projects");
	Issue.findIssueByCode(req.params.code,req.params.bref,function(issue){
		res.json({status:true,result:issue});
	});
});

router.post("/add",function(req,res){
	var m = require("mongoose");
	var Issue = m.model("project_issues");
	Issue.add(req.body.project_id,
		req.body.owner,
		req.body.title,		
		req.body.description,
		req.body.status || 'new',
		req.session.user.id,
		function(items){
			res.json({body:req.body,result:items});
	});
});
router.all("/list/:project_id",function(req,res){
	var m = require("mongoose");
	var Issue = m.model("project_issues");
	var Project = m.model("project_items");
	Issue.find({project:req.params.project_id}).exec(function(err,data){
		if (!err){
			res.json({status:true,result:data});
		}else{
			res.json([]);
		}
	})
});
router.all("/list_old/:project_id",function(req,res){
	var m = require("mongoose");
	var Issue = m.model("project_issues");
	var Project = m.model("project_items");
	var Promise = require("promise");
	var p1 = new Promise(function(resolve,reject){
		Project.find({project:req.params.project_id}).exec(function(err,items){
			if (!err){				
				resolve(items);	
			}else{
				reject(err);
			}
			
		});			
	})
	
	p1.then(function(items){
		var in_arr = [];
		items.forEach(function(item){
			in_arr.push(item._id);
		});
		
		Issue.find({owner:{$in:in_arr}}).populate("user").exec(function(err,issues){
			if (!err){
				res.json({status:true,result:issues});			
				/*
				var results = [];
				items.forEach(function(item){
					var result = {_id:item._id,
						title:item.title,
						description:item.description,
						user:item.user,
						issues:[]};					
					issues.forEach(function(issue){
						if (issue.owner==item._id){
							result.issues.push(issue);
						}
					});
					results.push(result);
				});

				res.json({status:true,result:results});
				*/	
			}else{
				console.log(err);
			}
		})
	},null);
	
});

router.get("/:code-:bref",function(req,res){
	var m = require("mongoose");
	var Issue = m.model("project_issues");
	var Project = m.model("projects");
	Issue.findIssueByCode(req.params.code,req.params.bref,function(issue){
		res.json({status:true,result:issue});
	});
});
module.exports = router;