module.exports = function(req,res,next){
	
	res.locals.base_url = req.protocol +"://"+req.headers.host;
	if (req.session && req.session.is_login){
		res.locals.user = req.session.user;
		res.locals.is_login = true;
		next();
	}else{
		res.locals.user = {id:0,name:"Unknown"};
		res.locals.is_login = false;
		res.redirect("/users/login?url="+req.originalUrl);
	}
}