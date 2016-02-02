var express = require("express");
var router = express.Router();

router.use(function(req,res,next){
	if (req.session.is_login){
		next();
	}else{
		res.redirect("/users/login?url="+req.originalUrl);
	}
});


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
		m.model("book_histories").chapter(req.session.user,new m.Types.ObjectId(req.params.id),function(item){
			var json = {result:items,status:true};
			if (item){
				json.chapter = item.chapter;
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
		m.model("book_histories").history(req.session.user,item.book_id,item);
		res.json(item);
	});
});


module.exports = router;
