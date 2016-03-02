var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var siteSchema = new Schema({
	name:String,
	url:String,
	last_updated:Date
});

var feedSchema = new Schema({
	site:{ ref:'feed_sites',type:Schema.ObjectId},
	title:String,
	link:String,
	pubDate:Date,
	author:String,
	content:String
})

// find by url, if not then insert, if found then update
siteSchema.statics.add = function(name,url,callback){
	var site = {name:name, url:url};
	Site.update(
		{url:url},
		site,
		{upsert:true},
		function(err,item){
			if (err){
				if (callback) callback(err,null);
			}else{
				Site.findOne({url:url}).lean().exec(function(err,site){
					if (err){
						if (callback) callback(err,null);		
					}else{
						if (callback) callback(null,site);
					}
				})
			}
			
		}
	);
}
siteSchema.statics.feed = function(site,entry,callback){
	var item = { site:site, title:entry.title, link:entry.link, pubDate:entry.pubDate,
		anthor:entry.author, content:entry.content };
	Feed.update(
		{site:site,link:entry.link},
		item,
		{upsert:true},
		function(err,item){
			if (callback) callback(err,item);
		}
	);
}
siteSchema.statics.list = function(callback){
	Feed.find().lean().populate("site").exec(callback);
}




var Site = mongoose.model("feed_sites",siteSchema);
var Feed = mongoose.model("feed_items",feedSchema);
module.exports = Site;
console.log("Register Feeds success!");