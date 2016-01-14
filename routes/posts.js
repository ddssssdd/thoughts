var express = require("express");
var router = express.Router();
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart({uploadDir:__dirname +"\\..\\uploads\\temp\\"});



router.use(function timelog(req,res,next){
	console.log('Time',Date.now());
	next();
});

router.get("/",function(req,res){
	res.render("posts/index",{post:{}});
});
router.get("/index",function(req,res){
	res.render("posts/index",{post:{}});
});

router.get("/list",function(req,res){
	
	var post_model = require("mongoose").model("posts");
	post_model.find({}).populate("user").exec(function(err,posts){
		//res.json(posts);
		res.render("posts/list",{posts:posts});
	});
});

router.get("/attach_list",function(req,res){
	
	var attachments = require("mongoose").model("attachments");
	attachments.find({}).populate("fileId").exec(function(err,attachments){
		res.json(attachments);
		//res.render("posts/list",{posts:posts});
	});
});


router.post("/add", multipartMiddleware,function(req,res){
	console.log(req.body);
	//console.log(req.files);
	//res.json(req.files);
	//return;
	var mongoose = require("mongoose");
	var post_model = mongoose.model("posts");
	var update_files_post = function(post_id){
		for(var key in req.files){
			var file = req.files[key];		
			console.log(file);		
			if (file && file.size>0 && file.path!=''){
				var path = require("path");
				var Upload = mongoose.model("uploads");
				var fs = require("fs");
				var oldname = path.basename(file.path);
				var newname = __dirname +"\\..\\uploads\\posts\\"+oldname;			
				fs.rename(file.path,newname,function(err){
					if (err){
						console.log(err);
						//res.redirect(req.url);
						return;
					}
					fs.unlink(file.path,function(err){
						if (err){
							console.log("Can not drop "+file.path);
						}
						
						var upload = new Upload({filename:file.originalFilename,
							link:"/posts/"+oldname,
							size:file.size,
							type:file.type,
							user:req.user,
							uploaded_date:Date.now()
						});
						upload.save(function(err,data){
							if (!err){
								mongoose.model("attachments").collection.insert(
									//{post:post_id,file_id:data._doc._id.id}
									{ownerId:post_id,fileId:upload.id}
								);
							}
						});
					});

				});	
			
			}
		
		}	
	}
	//res.json(req.body);
	
	var update = {content:req.body.content,
			created_date:Date.now(),
			user:req.session.user}
	if (req.body.id){

		post_model.findOneAndUpdate({_id:req.body.id},update,function(err,post){
			update_files_post(req.body.id);
			res.redirect("list");
		});
	}else{
		var post = new post_model(update);
		post.save(function(err){
			update_files_post(post.id.toString());
		});			
		res.redirect("list");
	}
	
	
});
router.get("/edit/:id",function(req,res){
	var m = require("mongoose");
	var post_model = m.model("posts");
	post_model.findOne({_id:req.params.id},function(err,post){
		
		var attachments = m.model("attachments");	
		attachments.find({ownerId:req.params.id}).populate("fileId").exec(function(err,items){			
			//res.json("posts/index",{post:post,attachments:items});
			res.render("posts/index",{post:post,attachments:items});
		});	
		
	})
});
router.get("/attachments/:id",function(req,res){
	var m = require("mongoose");	
	var attachments = m.model("attachments");
	
	attachments.find({ownerId:req.params.id}).populate("fileId").exec(function(err,data){
		console.log(err);
		res.json(data);
	});	
	/*
	var posts = m.model("posts");
	posts.findById(req.params.id,function(err,post){
		if (err){
			res.end("Post Id Error");
			return;
		}
		var attachments = m.model("attachments");
	
		attachments.find({ownerId:post.id},function(err,data){
			console.log(err);
			res.json(data);
		});	

	})
	*/
	return;
	attachments.find({ownerId:req.params.id}).populate("fileId").exec(function(err,files){
		if (err){
			console.log(err);
			return;
		}
		res.json(files);
	});
});
router.get("/remove/:id",function(req,res){
	var post_model = require("mongoose").model("posts");
	post_model.findOneAndRemove({_id:req.params.id},function(err,post){		
		res.redirect("/posts/list");
	});
});
module.exports = router;