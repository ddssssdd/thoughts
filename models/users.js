var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var userSchema = {
	name:String,
	email:String,
	password:String,
	last_login:Date,
	points:Number,
	avatar:String
}
users = mongoose.model("users",userSchema);
module.exports = users;
console.log("Register users success!");