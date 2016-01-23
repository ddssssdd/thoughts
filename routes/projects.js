var express = require("express");
var router = express.Router();
var multipart = require('connect-multiparty');
var config = require("../config");
var temp_path = __dirname +"/.." + config.uploads.temp;
var multipartMiddleware = multipart({uploadDir:temp_path});



router.use(function timelog(req,res,next){
	console.log('Time',Date.now());
	next();
});
router.use(function(req,res,next){
	if (req.session.is_login){
		next();
	}else{
		res.redirect("/users/login?url="+req.originalUrl);
	}
});
router.get("/send2",function(req,res){
	var email = {to:"a060116@163.com",subject:"subject",html:"test",attachments:[]};
	require("../common/email").send_and_call(req.session.user,email,function(err,info){
		res.json(info);
	});
})
router.get("/send",function(req,res){
	var att = [{filename:'text1.txt',content:'this is attachment'},{path:"/Users/stevenfu/Pictures/0824ab18972bd407ce1502f479899e510eb309ed.jpg"}];
	require("../common/email").send(req.session.user,"a060116@163.com","another test newvsssvvs saad","this is body");
	res.end("Send!");
})
router.get("/test",function(req,res){
	var Project = require("mongoose").model("projects");
	var project = new Project({user:req.session.user,title:"thoughts",code:"thg",description:"This is thoughts project."});
	project.save(function(err,result){
		res.json(result);
	});
})

module.exports = router;