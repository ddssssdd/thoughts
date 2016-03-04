var express = require("express");
var router = express.Router();


router.get("/",function(req,res){
	res.redirect("/news/index");
});
router.get("/index",function(req,res){
	res.render("news/index");
});

router.get("/read",function(req,res){
	res.render("news/read");	
	
});
router.post("/refresh",function(req,res){
	require("../common/spider").update_feeds(function(results){
		res.json({status:true});
	});
});

router.post("/sites",function(req,res){
	var m = require("mongoose");
	m.model("feed_sites").sites(function(err,sites){
		res.json({status:err?false:true,result:sites});
	})
});

router.post("/add_site",function(req,res){
	var m = require("mongoose");
	var Site = m.model("feed_sites");
	Site.add(req.body.name,req.body.url,function(err,sites){
		res.json({status:err?false:true,result:sites});
	});
})
router.post("/remove_site",function(req,res){
	var m = require("mongoose");
	var Site = m.model("feed_sites");
	Site.remove_site(req.body.id,function(err,sites){
		res.json({status:err?false:true,result:sites});
	});
});
router.post("/news",function(req,res){
	var m = require("mongoose");
	m.model("feed_sites").list(req.body.index || 1, req.body.size || 20,function(err,news){
		res.json({status:err?false:true,result:news});
	})
});



module.exports = router;