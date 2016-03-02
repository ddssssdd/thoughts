var express = require("express");
var router = express.Router();


router.get("/",function(req,res){
	res.redirect("/news/index");
});
router.get("/index",function(req,res){
	res.render("news/index");
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
})

module.exports = router;