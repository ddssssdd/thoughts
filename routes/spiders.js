var express = require("express");
var router = express.Router();




var update_book = function (book,index,url,title){
	var m = require("mongoose");
	var spider = require("../common/spider");
	var BookItems = m.model("book_items");
	spider.load_html(url,"#content",function(ele){
		if (ele.status){

			BookItems.insertOrUpdate(book,index,url,title,ele.result);
		}
	});
}
router.get("/add",function(req,res){
	var m = require("mongoose");
	var Book = m.model("books");
	Book.find({},function(err,data){
		res.render("spiders/add",{books:data});		
	})
	
	
});
router.post("/add_book",function(req,res){
	//res.json(req.body);
	var m = require("mongoose");
	var Book = m.model("books");
	var BookItems = m.model("book_items");
	var spider = require("../common/spider");
	var name =req.body.name;
	var book_url = req.body.url;
	spider.load_url(book_url,"dd>a",function(json){
		var list = [];
		if (json.status){

			json.result.each(function(){
				try{
					if (this.attribs && this.attribs.href){
						list.push({url:book_url+this.attribs.href.replace(/\s/g,''),title:this.children[0].data});
					}	
				}catch(err){
					console.log(err);
				}
				
			});
			Book.inserOrUpdate(name,book_url,"biquge",function(book){
				for(var i=0;i<list.length;i++){
					var item = list[i];
					var index = i;
					var item_url = item.url;
					var item_title = item.title;
					update_book(book,index,item_url,item_title);
					//break;
					
				};
			})
		}

		//res.json(list);
		res.redirect("/spiders/add");
	});
})
router.get("/read/:id",function(req,res){
	res.render("spiders/index",{book_id:req.params.id});	
	
});

router.post("/load_book/:id",function(req,res){
	var m = require("mongoose");
	
	var BookItems = m.model("book_items");
	BookItems.find({book_id: new m.Types.ObjectId(req.params.id)},"id title index",{sort:{index:1}},function(err,items){
		if (err){
			console.log(err);
		}
		m.model("book_histories").chapter(req.session.user.id,new m.Types.ObjectId(req.params.id),function(item){
			var json = {result:items,status:true};
			if (item){
				json.chapter = item.chapter;
				json.book = item.book;
			}
			res.json(json);
		});
		
	});
});
router.post("/load_chapter/:id",function(req,res){
	var m = require("mongoose");
	
	var BookItems = m.model("book_items");
	BookItems.findOne({_id: new m.Types.ObjectId(req.params.id)},function(err,item){
		if (err){
			console.log(err);
		}
		m.model("book_histories").history(req.session.user.id,item.book_id,item);
		res.json(item);
	});
});
router.post("/remove_chapter",function(req,res){
	var m = require("mongoose");	
	var BookItems = m.model("book_items");
	BookItems.remove({_id:req.body.id},function(err,raw){
		res.json(raw);
	});
});
router.post("/update_book",function(req,res){
	var id = req.body.id;
	var in_scheduled = req.body.in_scheduled;
	var m = require("mongoose");
	var Book = m.model("books");
	Book.update({_id:id},{$set:{in_scheduled:in_scheduled}},function(err,raw){
		res.json({status:!err,result:raw});
	})
});

router.get("/test",function(req,res){
	schedule_update(function(data){
		res.json(data);
	})
});

module.exports = router;

var schedule_update = function(callback){
	var result = [];
	var m = require("mongoose");
	var Book = m.model("books");
	var Items = m.model("book_items");
	var spider = require("../common/spider");
	var Promise = require("promise");
	debugger;
	Book.find({in_scheduled:true}).exec(function(err,books){
		//callback(books);
		if (err){
			callback({status:false,message:'Fetch data error'});

		}else{
			var arr = [];
			for(var i=0;i<books.length;i++){
				var book = books[i];
				var promise = new Promise(function(resolve,reject){
					
					spider.load_url(book.url,"dd>a",function(json){
						var list = [];
						if (json.status){
							var book_result =[];
							json.result.each(function(){
								try{
									if (this.attribs && this.attribs.href){
										var chapter = {url:book.url+this.attribs.href.replace(/\s/g,''),title:this.children[0].data};									
										list.push(chapter);
									}	
								}catch(err){
									console.log(err);
								}
								
							});

							for(var j=0;j<list.length;j++){
								var item = list[j];
								var index = j;
								var item_url = item.url;
								var item_title = item.title;
								//update_book(book,index,item_url,item_title);
								var verifyAndUpdate = function (book,item_url,item_title,index){
									Items.findOne({book_id:book,url:item_url},function(err,book_chapter){
										if (!err && book_chapter){
											console.log(book_chapter.title);
											//book_result.push({has:true,title:book_chapter.title});

										}else{									
											update_book(book,index,item_url,item_title);																				
											book_result.push({book:book,index:index,title:item_title});
											console.log("Added ..............................." +item_title);
										}
							
									});	
								}
								verifyAndUpdate(book,item_url,item_title,index);
									
							};

							resolve(book);
						}else{
							reject(json);
						}
						
					});
				});				
				arr.push(promise);	
			}
			Promise.all(arr)
			.then(function(data){
					console.log(data);
					callback(data);
				},function(errors){
					console.log(errors);
			});
		}
		
	})
}

