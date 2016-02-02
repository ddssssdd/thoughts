var express = require("express");
var router = express.Router();
var request = require("request");
var cheerio = require("cheerio");
var iconv = require("iconv-lite");

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

		res.json(list);
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
		res.json(items);
	});
});
router.post("/load_chapter/:id",function(req,res){
	var m = require("mongoose");
	
	var BookItems = m.model("book_items");
	BookItems.findOne({_id: new m.Types.ObjectId(req.params.id)},function(err,item){
		if (err){
			console.log(err);

		}
		res.json(item);
	});
});

router.get("/load_html",function(req,res){
	var spider = require("../common/spider");
	spider.load_html("http://www.biquge.la/book/2360/1333977.html","#content",function(data){
		res.json(data);
	});
})
router.get("/load3",function(req,res){
	var m = require("mongoose");
	var Book = m.model("books");
	var BookItems = m.model("book_items");
	var spider = require("../common/spider");
	var name ="篡唐";
	var book_url = "http://www.biquge.la/book/2360/";
	spider.load_url(book_url,"dd>a",function(json){
		var list = [];
		if (json.status){

			json.result.each(function(){
				
				if (this.attribs){
					list.push({url:book_url+this.attribs.href,title:this.children[0].data});
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

		res.json(list);
	})

});

router.get("/load",function(req,response){
	
	//request({url:"http://www.ne.qdedu.net/index.aspx?pkId=7203",encoding:"gb2312"},function(err,res,body){
	request({encoding:null,url:"http://www.ne.qdedu.net/index.aspx?pkId=7203"},function(err,res,body){
		if (!err && res.statusCode == 200){
			body = iconv.decode(body,'gb2312').toString();
			var $ = cheerio.load(body);
			var list = [];
			debugger;
			$("a.news").each(function(){
				console.log(this);
				if (this.attribs){
					//this.attribs.title2 = iconv.decode(this.attribs.title,"gb2312");
					list.push(this.attribs);
				}
			});
			response.json(list);
		}
	});
});
router.get("/load2",function(req,response){
	
	//request({url:"http://www.ne.qdedu.net/index.aspx?pkId=7203",encoding:"gb2312"},function(err,res,body){
	request({encoding:null,url:"http://www.ne.qdedu.net/newsInfo.aspx?pkId=33708"},function(err,res,body){
		if (!err && res.statusCode == 200){
			body = iconv.decode(body,'gb2312').toString();
			var $ = cheerio.load(body);
			var list = [];
			debugger;
			var obj = $("td.newsContent");
			console.log(obj.text());
			response.end(obj.text());
			/*
			$("td.newsContent").each(function(){
				console.log(this);
				if (this.attribs){
					//this.attribs.title2 = iconv.decode(this.attribs.title,"gb2312");
					list.push(this.attribs);
				}
			});
			
			response.json(list);
			*/
		}
	});
});

module.exports = router;
