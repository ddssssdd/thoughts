var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var postSchema = {
	content:String,
	created_date:Date,	
	user:{
		type:Schema.ObjectId,
		ref:"users"
	}
}
var attachSchema = {
	post: Schema.ObjectId,
	file_id:Schema.ObjectId
}
mongoose.model("post_attahments",attachSchema);
posts =mongoose.model("posts",postSchema);
module.exports = posts;