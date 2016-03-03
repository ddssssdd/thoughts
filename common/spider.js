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

var update_feeds = function(callback){
	var m = require("mongoose");
	var Site = m.model("feed_sites");      
	var Promise = require("promise");
	var get_sites =  function(){
		return new Promise(function(resolve,reject){
			Site.sites(function(err,sites){
				if (sites && sites.length>0){
					resolve(sites);
				}else{
					reject(err);
				}
			});
		});
	}

	var process_site = function(site){
		return new Promise(function(resolve,reject){
			console.log("Begin fetch "+ site.url)
	        var parser = require("rss-parser");
	        parser.parseURL(site.url,function(err,result){
	        	if (!err){
	        		result.site = site;
	        		resolve(result);
	        	}else{
	        		reject(err);
	        	}
	        	
	        });	
		});
	};
	var save_result = function(result){
		//debugger;
		result.feed.entries.forEach(function(entry){
        	//console.log(entry);
            Site.feed(result.site,entry);
        });
	}
	var save_results = function(results){
		results.forEach(save_result);	
		callback(results);	
	}
	
	get_sites().then(function(sites){
		/*var query = [];
		sites.forEach(function(site){			
			query.push(process_site(site));
		});
		Promise.all(query).then(save_results);
		*/
		Promise.all(sites.map(function(site){ 
			return process_site(site);}))
		.then(save_results);
		
	}).catch(function(err){
		callback(err);
	});
}



module.exports ={
	load_url:load_url,
	load_html:load_html,
	update_feeds:update_feeds
}