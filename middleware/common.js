module.exports = function(req,res,next){
	if (req.method.toUpperCase()=='GET'){
		res.locals.app_title = "Thoughts-go";
		res.locals.base_url = req.protocol +"://"+req.headers.host;
		res.locals.menu = req.path;
		res.locals.user = {id:0,name:"Unknown"};
		res.locals.is_login = false;	
	
		if (req.session && req.session.user){
			var mongoose = require("mongoose");
			var UserLog = mongoose.model("user_logs");
			UserLog.log(req.session.user.id,req.originalUrl,null);	
		}	
	}
	next();

	
}