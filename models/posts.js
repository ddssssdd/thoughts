var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var postSchema = {
	content:String,
	created_date:Date	
}
posts =mongoose.model("posts",postSchema);
module.exports = posts;