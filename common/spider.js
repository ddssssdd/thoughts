var request = require("request");
var cheerio = require("cheerio");
var iconv = require("iconv-lite");
var load_url = function(url,selector,callback){
	request({encoding:null,url:url},function(err,res,body){
		if (!err && res.statusCode == 200){
			body = iconv.decode(body,'gb2312').toString();

			var $ = cheerio.load(body);
			var result = $(selector);
			if (callback) callback({status:true,result:result});
			return;
		}
		if (callback) callback({status:false});


	});
}
var load_html = function(url,selector,callback){
	request({encoding:null,url:url},function(err,res,body){
		if (!err && res.statusCode == 200){

			body = iconv.decode(body,'gb2312').toString();
			//console.log(body);
			

			var $ = cheerio.load(body,{decodeEntities:true});
			//var result = $(selector).text();
			var result = $(selector).contents();
			debugger;
			var list =[];
			result.each(function(){
				if (this.type=='text'){
					list.push(this.data);
				}
			})
			if (callback) callback({status:true,result:list.join("<br/>")});
			return;
		}
		if (callback) callback({status:false});

	});
}




module.exports ={
	load_url:load_url,
	load_html:load_html
}