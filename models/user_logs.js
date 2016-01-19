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

//instance
User_logSchema.methods.findByUser = function(user_id,callback){
	
	return this.model("user_logs").find({user:user_id}).populate("user").exec(callback);
}

//static 
User_logSchema.statics.log  = function(user,content,callback){
	new user_logs({content:content,user:user,created_date:Date.now()}).save(callback);
}
User_logSchema.pre("save",function(next,done){
	
	console.log(done);
	next();
});
user_logs =mongoose.model("user_logs",User_logSchema);
module.exports = user_logs;
console.log("Register user_logs success!");