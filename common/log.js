var mongoose = require("mongoose");
var UserLog = mongoose.model("user_logs");


module.exports = function(req){
	UserLog.log(req.session.user,req.originalUrl,null);
}