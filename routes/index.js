module.exports = function(app){
	

	app.get("/index",function(req,res){
		console.log(req);		
		var data = {title:"This is a test",is_login:req.session.is_login,user:req.session.user}
		
		res.render("index",data);
	});
	app.get("/menu",function(req,res){
		res.json({title:"test",description:"this is description"});
	})
	app.get("/test",function(req,res){
		res.end("this is a test");
	});
	app.get("/set/:name",function(req,res){
		req.session.name = req.params.name
		res.redirect("/get");
	});
	app.get("/get",function(req,res){
		res.json(req.session);
	});
}