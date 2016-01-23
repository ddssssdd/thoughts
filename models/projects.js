var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ProjectSchema = new Schema({
		title:String,
		description:String,
		code:String,
		created_date:Date,
		user:{
			type:Schema.ObjectId,
			ref:"users"
		}
	});

//instance
ProjectSchema.methods.findByUser = function(user_id,callback){
	
	return this.model("projects").find({user:user_id}).populate("user").exec(callback);
}
ProjectSchema.methods.findByCode = function(code,callback){
	
	return this.model("projects").find({code:code}).populate("user").exec(callback);
}


ProjectSchema.pre("save",function(next,done){
	//console.log("Before saving projects:")
	//console.log(this);
	this.created_date = Date.now();
	next();
});
ProjectSchema.post("save",function(doc){
	console.log(doc);
})
projects =mongoose.model("projects",ProjectSchema);
module.exports = projects;
console.log("Register projects success!");