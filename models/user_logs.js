var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var User_logSchema = new Schema({
		content:String,
		created_date:Date,	
		user:{
			type:Schema.ObjectId,
			ref:"users"
		}
	});
var User_searchSchema = new Schema({
	key:String,
	tags:Array,
	created_date:Date,
	user:{
		type:Schema.ObjectId,
		ref:"users"
	}
});
User_searchSchema.statics.log = function(user,key){
	var history = {key:key,
					tags:key.split(" "),
					created_date:Date.now(),
					user:user};
	this.update({key:key},history,{upsert:true},function(err,raw){
		if (!err){
			console.log(raw);
		}
	})
	/*
	new user_search_history(history).save(function(err,raw){
		console.log(raw);
	});
	*/
}
User_searchSchema.statics.histories = function(user,callback){
	user_search_history.find({user:user}).limit(20).sort({created_date:-1}).exec(function(err,data){
		if (!err){
			callback(data);
		}else{
			callback([]);
		}
	});
}
//instance
User_logSchema.methods.findByUser = function(user_id,callback){
	
	return this.model("user_logs").find({user:user_id}).populate("user").exec(callback);
}

//static 
User_logSchema.statics.log  = function(user,content,callback){
	new user_logs({content:content,user:user}).save(callback);
}
User_logSchema.pre("save",function(next,done){
	this.created_date = Date.now();
	//console.log(done);
	next();
});
user_logs =mongoose.model("user_logs",User_logSchema);
user_search_history = mongoose.model("user_search_history",User_searchSchema);
module.exports = user_logs;
console.log("Register user_logs success!");