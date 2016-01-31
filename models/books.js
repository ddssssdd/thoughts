
var request = require("request");
var cheerio = require("cheerio");
var iconv = require("iconv-lite");

var mongoose = require("mongoose");

var Schema = mongoose.Schema;
var BookSchema = new Schema({
		title:String,
		url:String,
		source:String,
		last_updated:Date
	});


BookSchema.statics.inserOrUpdate = function(name,url,source,callback){
	var that = this;
	this.update({title:name},
		{title:name,url:url,source:source},
		{upsert:true},
		function(err,raw){
			if (!err){
				that.findOne({title:name},function(err,book){
					callback(book);
				});
				
			}
			console.log(err);
	})
}
var detailSchema = new Schema({
	book_id:{
		ref:"books",
		type:Schema.ObjectId
	},
	index:Number,
	url:String,
	title:String,
	content:String,
	last_updated:Date
});

detailSchema.statics.insertOrUpdate = function(book,index,url,title,content){
	var con = {book_id:book,index:index,url:url};
	this.update(
		con,
		{book_id:book,index:index,url:url,title:title,content:content,last_updated:Date.now()},
		{upsert:true},
		function(err,item){
		if (err){
			console.log(err);
		}else{
			console.log(con);
		}
	})
}
books = mongoose.model("books",BookSchema);
mongoose.model("book_items",detailSchema);

module.exports = books;

console.log("Register books and book_items success")