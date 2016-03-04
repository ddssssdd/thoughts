var express = require("express");
var router = express.Router();
var multipart = require('connect-multiparty');
var config = require("../config");
var temp_path = __dirname +"/.." + config.uploads.temp;
var multipartMiddleware = multipart({uploadDir:temp_path});

var move_and_save = function(id,filepath,size,type,fileoriginal,user_id,callback){
	var mongoose = require("mongoose");
	var path = require("path");
	var Upload = mongoose.model("uploads");
	var fs = require("fs");
	
	var oldname = path.basename(filepath);
	
	var newname = __dirname +"/.." +config.uploads.posts + oldname;			
	fs.rename(filepath,newname,function(err){
		if (err){
			console.log(err);
			//res.redirect(req.url);
			return;
		}
		fs.unlink(filepath,function(err){
			if (err){
				console.log("Can not drop "+filepath);
			}
			
			var upload = new Upload({filename:fileoriginal,
				link:config.uploads.link_base+oldname,
				size:size,
				type:type,
				user:user_id,
				uploaded_date:Date.now()
			});
			upload.save(function(err,data){
				if (!err){
					mongoose.model("attachments").add(id,upload,function(raw){
							mongoose.model("attachments").findFile(id,function(err,data){
								if (callback){
									callback(data);
								}
							})	
						});
					/*
					mongoose.model("attachments").collection.insert(
						{ownerId:id,fileId:upload.id}
					);
					*/
				}
			});
		});

	});
}	



router.get("/",function(req,res){
	res.redirect("index");
});
router.get("/index",function(req,res){
	
	//console.log(req.app.config);
	res.render("posts/index",{post_id:'0'});
});

router.get("/list",function(req,res){
	
	var post_model = require("mongoose").model("posts");
	post_model.find({}).populate("user").exec(function(err,posts){
		//res.json(posts);
		res.render("posts/list",{posts:posts});
	});
});
router.post("/list",function(req,res){
	
	var post_model = require("mongoose").model("posts");
	post_model.find({}).populate("user").exec(function(err,posts){
		//res.json(posts);
		res.json({status:err?false:true,result:posts});
	});
});

router.get("/attach_list",function(req,res){
	
	var attachments = require("mongoose").model("attachments");
	attachments.find({}).populate("fileId").exec(function(err,attachments){
		res.json(attachments);
		//res.render("posts/list",{posts:posts});
	});
});
router.post("/upload_file",multipartMiddleware,function(req,res){	
	var id = req.body.key;
	for(var key in req.files){
		var file = req.files[key];		
		
		if (file && file.size>0 && file.path!=''){
			move_and_save(id,file.path,file.size,file.type,file.originalFilename,req.session.user.id,function(items){
				res.json({status:true,result:items});
			});
		}		
	}	

});
router.post("/upload_image",multipartMiddleware,function(req,res){	
	var data = req.body.imgdata;
	data = data.substr(data.indexOf(",")+1);
	var buf = new Buffer(data,'base64');	
	var fs = require("fs");
	var temp_path = __dirname +"/.." +config.uploads.posts;
	var originalFilename = Date.now()+".png"
	var filename = temp_path + originalFilename;
	fs.writeFile(filename,buf,"base64",function(err){
		if (!err){
			//res.json({status:true,result:{name:filename,size:data.length,type:"image/jpeg"}});
			var m = require("mongoose");
			var Upload = m.model("uploads");
			var upload = new Upload({filename:originalFilename,
				link:config.uploads.link_base+originalFilename,
				size:data.size,
				type:"image/jpeg",
				user:req.session.user.id,
				uploaded_date:Date.now()
			});
			upload.save(function(err,data){
				if (!err){					
								
					if (req.body.key){						
						m.model("attachments").add(req.body.key,upload,function(raw){
							m.model("attachments").findFile(req.body.key,function(err,data){
								res.json({status:true,result:data});
							})	
						});
						
					}else{
						res.json({status:true,result:upload});		
					}
					
				}else{
					res.json({status:false,message:"Save to uploads error"});
				}
			});
		}else{
			res.json({status:false,message:"Can not upload the image.",error:err})
		}
	});
	
});
router.post("/add", multipartMiddleware,function(req,res){
	console.log(req.body.attachments);
	//console.log(req.files);
	//res.json(req.files);
	//return;
	
	var mongoose = require("mongoose");
	var post_model = mongoose.model("posts");
	var update_files_post = function(post_id){
		//step 1 save paste files;
		debugger;
		if (req.body.attachments && req.body.attachments.length>0){
			if (typeof(req.body.attachments)=="string"){
				req.body.attachments =[req.body.attachments];
			}
			var ObjectId = mongoose.Types.ObjectId;
			for(var i=0;i<req.body.attachments.length;i++){
				var attach = req.body.attachments[i];
				mongoose.model("attachments").collection.insert(
					{ownerId:post_id,fileId:new ObjectId(attach)}
				);
			}
		}
		
		for(var key in req.files){
			var file = req.files[key];		
			console.log(file);		
			if (file && file.size>0 && file.path!=''){
				
				var Upload = mongoose.model("uploads");
				var fs = require("fs");
				move_and_save(post_id,file.path,file.size,file.type,file.originalFilename,req.session.user.id);
			}		
		}	
	}
	//res.json(req.body);
	
	var update = {content:req.body.content,
			created_date:Date.now(),
			user:req.session.user.id}
	if (req.body.id){

		post_model.findOneAndUpdate({_id:req.body.id},update,function(err,post){
			update_files_post(req.body.id);
			
		});
		res.redirect("list");
	}else{
		var post = new post_model(update);
		post.save(function(err){
			update_files_post(post.id.toString());
		});			
		res.redirect("list");
	}
	
	
});
router.get("/edit/:id",function(req,res){
	res.render("posts/index",{post_id:req.params.id});
});
router.post("/edit",function(req,res){
	var m = require("mongoose");
	var post_model = m.model("posts");
	post_model.findOne({_id:req.body.id}).lean().exec(function(err,post){
		
		var attachments = m.model("attachments");	
		attachments.find({ownerId:req.body.id}).lean().populate("fileId").exec(function(err,items){			
			res.json({post:post,attachments:items});
			
			/*res.render("posts/index",{post:post,
				attachments:items,
				post_s:JSON.stringify(post),
				attachments_s:JSON.stringify(items)});
			*/
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
router.post("/attachment_delete",function(req,res){
	
	var attachments = require("mongoose").model("attachments");
	attachments.remove({_id:req.body.id},function(err,attachments){
		res.json({status:err?false:true});		
	});
});
module.exports = router;