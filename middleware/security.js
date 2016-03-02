module.exports = function(req,res,next){
	if (req.session && req.session.is_login){		
		res.locals.user = req.session.user;
		//res.locals.user_json = JSON.stringify(req.session.user);
		res.locals.is_login = true;
		next();
	}else{		
		res.redirect("/users/login?url="+req.originalUrl);
	}
}