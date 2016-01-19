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
User_logSchema.methods.findByUser = function(user_id,callback){
	return this.find({user:user_id},callback);
}
User_logSchema.pre("save",function(next,done){
	console.log(done);
	next();
});
user_logs =mongoose.model("user_logs",User_logSchema);
module.exports = user_logs;
console.log("Register user_logs success!");