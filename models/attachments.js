var mongoose = require("mongoose");


var Schema = mongoose.Schema;
var attachmentSchema = new Schema({
	ownerId: String,		
	fileId:{
		type:Schema.ObjectId,
		ref:"uploads"
	}
});
attachmentSchema.statics.add = function(ownerId,file){
	var attachment = new Attachments({ownerId:ownerId,fileId:file});
	attachment.save(function(err,raw){
		console.log(raw);
		if (!err){

		}else{
			console.log(err);
		}
	})
}
attachmentSchema.statics.findFile = function(ownerId,callback){
	Attachments.find({ownerId:ownerId}).populate("fileId").exec(callback);
}
var Attachments =mongoose.model("attachments",attachmentSchema); 
module.exports = Attachments;
console.log("Register attachments success!");