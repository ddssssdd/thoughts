var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var uploadSchema = new Schema({
	filename:String,
	link:String,
	size:Number,
	type:String,
	uploaded_date:Date,
	user:{
		type:Schema.ObjectId,
		ref:"users"
	}
});
module.exports = mongoose.model("uploads",uploadSchema);
console.log("Register uploads success!");