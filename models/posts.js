var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var postSchema = new Schema({
	title:String,
	content:String,
	created_date:Date,	
	user:{
		type:Schema.ObjectId,
		ref:"users"
	}
});

posts =mongoose.model("posts",postSchema);
module.exports = posts;
console.log("Register posts success!");