var express = require("express");
var router = express.Router();


router.use(function(req,res,next){
	//console.log(req.url);
	
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
	res.locals.base_url =  req.protocol +"://"+req.headers.host;
	res.locals.user = {id:0,name:"Unknown"};
	res.locals.is_login = false;
	if (skipped(req.url.toLowerCase())){				
		next();
	}else if (req.session.is_login){

		res.locals.user = req.session.user;
		res.locals.is_login = true;
		console.log(res.locals);
		next();
	}else{		
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
	user_model.findOne({_id:req.session.user.id},function(err,user){
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
	//return;
	if (!req.body.username || !req.body.password){
		res.redirect("/users/login");
		return;
	}
	var user_model = require("mongoose").model("users");
	user_model.findOne({name:req.body.username}).lean().exec(function(err,user){
		
		if (user){			
			req.session.is_login = true;
			user.avatar = user.avatar || '/assets/avatars/face-ico.png';
			user.id = user._id;
			req.session.user = user;// {id:user.id,name:user.name,email:user.email,avatar:(user.avatar || '/assets/avatars/face-ico.png')};	
			
			
		}
		var url = req.body.return_url || "/index";
		res.redirect(url);
	});
});
router.get("/logout",function(req,res){
	delete req.session.is_login;
	delete req.session.user;
	res.redirect("/index");
});

router.post("/settings_change",function(req,res){
	var m = require("mongoose");
	var User = m.model("users");
	var item = {};
	item[req.body.name] = req.body.value;
	User.update({_id:req.body.pk},{$set:item},function(err,data){
		if (!err){
			req.session.user[req.body.name] = req.body.value;
		}
		res.json({status:err?false:true,result:data});
	})
});

router.get("/settings",function(req,res){	
	res.render("users/settings");
});

router.get("/profile",function(req,res){	
	res.render("users/profile");
});

module.exports = router;