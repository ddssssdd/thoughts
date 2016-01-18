var mongoose = require("mongoose");


var Schema = mongoose.Schema;
var attachmentSchema = {
	ownerId: String,		
	fileId:{
		type:Schema.ObjectId,
		ref:"uploads"
	}
}
var attachments =mongoose.model("attachments",attachmentSchema); 
module.exports = attachments;
console.log("Register attachments success!");