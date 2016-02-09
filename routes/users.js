var express = require("express");
var router = express.Router();


router.use(function(req,res,next){
	console.log(req.url);
	
	//if (["/login","/logout","/info"].indexOf(req.url.toLowerCase())>-1){

	var skipped = function(url){
		var should_skipped_array = ["/login","/add","/index","/logout","/info"];
		for(var i=0;i<should_skipped_array.length;i++){
			var s = should_skipped_array[i];
			if (url.indexOf(s)==0)
				return true;
		}
		return false;
	}		
	if (skipped(req.url.toLowerCase())){	
		res.locals.user = {id:0,name:"Unknown"};
		res.locals.is_login = false;	
		next();
	}else if (req.session.is_login){
		res.locals.user = req.session.user;
		res.locals.is_login = true;
		next();
	}else{
		res.locals.user = {id:0,name:"Unknown"};
		res.locals.is_login = false;
		res.redirect("/users/login?url="+req.originalUrl);
	}
});

router.get("/",function(req,res){
	res.redirect("/users/index");
});
router.get("/logs",function(req,res){
	//res.render("users/index",{user:{}});
	
	var m = require("mongoose");
	var UserLog = m.model("user_logs");
	
	
	new UserLog().findByUser(req.session.user.id,function(err,data){
		//res.json(data);
		res.render("users/logs",{logs:data});
	});
	
	/*
	UserLog.log(req.session.user,"Test new",function(err,log){
		
		console.log(err);
		res.json(log);
	})
	*/
	/*
	var userlog = new UserLog({content:"test2222",user:req.session.user});
	userlog.save(function(err,result){
		console.log(result);
		//res.json(result);
	});
	*/
});
router.get("/index",function(req,res){
	res.render("users/index",{user:{}});
});

router.get("/list",function(req,res){
	
	var user_model = require("mongoose").model("users");
	user_model.find({},function(err,users){
		//res.json(users);
		res.render("users/list",{users:users});
	});
});


router.post("/add",function(req,res){
	console.log(req.body);
	//res.json(req.body);
	var user_model = require("mongoose").model("users");
	if (req.body.id){
		user_model.findOneAndUpdate({_id:req.body.id},req.body,function(err,user){
			res.redirect("list");
		});
	}else{
		user_model.collection.insert(req.body);	
		res.redirect("list");
	}
	
	
});
router.get("/edit/:id",function(req,res){
	var user_model = require("mongoose").model("users");
	user_model.findOne({_id:req.params.id},function(err,user){
		//res.json({result:user,error:err,param:{_id:req.params.id}});
		res.render("users/index",{user:user})
	});
});
router.get("/remove/:id",function(req,res){
	var user_model = require("mongoose").model("users");
	user_model.findOneAndRemove({_id:req.params.id},function(err,user){		
		res.redirect("/users/list");
	});
});
router.post("/info",function(req,res){
	var user_model = require("mongoose").model("users");
	user_model.findOne({_id:req.session.user},function(err,user){
		//res.json({result:user,error:err,param:{_id:req.params.id}});
		if (user){
			res.json({status:true,result:user});	
		}else{
			res.json({status:false});
		}
		
	});
});

router.get("/login",function(req,res){
	res.render("login/index",{return_url:req.query.url || "/index"});
});
router.post("/login",function(req,res){
	//res.json(req.body);
	if (!req.body.username || !req.body.password){
		res.redirect("/users/login");
		return;
	}
	var user_model = require("mongoose").model("users");
	user_model.findOne({name:req.body.username},function(err,user){
		
		if (user){
			req.session.is_login = true;
			req.session.user = {id:user.id,name:user.name,email:user.email};	
		}
		var url = req.body.return_url;
		res.redirect(url);
	});
});
router.get("/logout",function(req,res){
	delete req.session.is_login;
	delete req.session.user;
	res.redirect("/index");
});
module.exports = router;