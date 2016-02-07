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
//for email test only;
/*
router.get("/send2",function(req,res){
	var email = {to:"a060116@163.com",from:"admin@admin.com",subject:"subject and abcdefghss",html:"test",attachments:[]};
	require("../common/email").send_and_sure(email,function(err,info){
		res.json(info);
	});
})
router.get("/send",function(req,res){
	var att = [{filename:'text1.txt',content:'this is attachment'},{path:"/Users/stevenfu/Pictures/0824ab18972bd407ce1502f479899e510eb309ed.jpg"}];
	require("../common/email").send(req.session.user,"a060116@163.com","another test newvsssvvs saad","this is body");
	res.end("Send!");
})
*/
router.get("/test",function(req,res){
	var Project = require("mongoose").model("projects");
	var project = new Project({user:req.session.user,title:"thoughts",code:"thg",description:"This is thoughts project."});
	project.save(function(err,result){
		res.json(result);
	});
});
router.get("/index/:id",function(req,res){
	//res.render("projects/index",{id:req.params.id || 0 });
	res.redirect("/projects/edit/"+(req.params.id || '0'));
});
router.get("/edit/:id",function(req,res){
	if (req.params.id==0){
		res.render("projects/index",{project:{id:0}});
		return;
	}
	var m = require("mongoose");
	var Project = m.model("projects");
	Project.findOne({_id: new m.Types.ObjectId(req.params.id)},function(err,project){
		if (err){
			console.log(err);
		}
		var data = {project:project || {id:0}};
		res.render("projects/index",data);	
	});
	
});

router.post("/add",function(req,res){
	var m = require("mongoose");
	var Project = m.model("projects");
	var p = {user:req.session.user,
		title:req.body.title,
		code:req.body.code,
		description:req.body.description};

	var id = req.body.id;
	if (id==0){
		var project = new Project(p);
		project.save(function(err,result){
			if (!err){
				res.redirect("/projects/list");
			}
		});	
	}else{
		Project.update({_id:new m.Types.ObjectId(id)},p,function(err,result){
			if (!err){
				console.log(result);
				res.redirect("/projects/list");
			}
		})
	}
	
});
router.post("/remove",function(req,res){
	var id = req.body.id;
	var m = require("mongoose");
	m.model("projects").remove({_id:new m.Types.ObjectId(id)},function(err,raw){
		if (!err){
			res.json(raw);
		}
	});
});
router.post("/list",function(req,res){
	var m = require("mongoose");
	var Project = m.model("projects");
	//Project.find({user:new m.Types.ObjectId(req.session.user)},function(err,data){
	(new Project()).findByUser(req.session.user,function(err,data){
		res.json(data);
	});
});
router.get("/list",function(req,res){
	res.render("projects/list");
});
router.post("/info",function(req,res){
	var m = require("mongoose");
	var Project = m.model("projects");
	Project.findOne({_id:new m.Types.ObjectId(req.body.id)},function(err,data){
		
		res.json(data);
	});
});

module.exports = router;