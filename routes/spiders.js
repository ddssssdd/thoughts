var express = require("express");
var router = express.Router();
var request = require("request");
var cheerio = require("cheerio");
var iconv = require("iconv-lite");

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
router.get("/read",function(req,res){
	var m = require("mongoose");
	var Book = m.model("books");
	var BookItems = m.model("book_items");
	BookItems.find({},function(err,items){
		for(var i=0;i<items.length;i++){
			var item = items[i];
			item.content = item.content.replace("<script>readx();</script>","");//.replace(/&#x/g,"\\\\");

			console.log(item.title);
		}
		//res.charset = "gb2312";
		res.render("spiders/index",{items:items});	
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
})
module.exports = router;
