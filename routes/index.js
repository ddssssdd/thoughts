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
		var User = require("mongoose").model("users");
		var user = new User({name:'admin',email:'a060116@163.com',password:'123456',points:10,last_login:Date.now()});
		user.save(function(err,result){
			res.json(result);
		})
		//res.end("this is a test");
	});
	app.get("/set/:name",function(req,res){
		req.session.name = req.params.name
		res.redirect("/get");
	});
	app.get("/get",function(req,res){
		res.json(req.session);
	});
	app.get("/load",function(req,response){
		var request = require("request");
		var cheerio = require("cheerio");
		var iconv = require("iconv-lite");
		//request({url:"http://www.ne.qdedu.net/index.aspx?pkId=7203",encoding:"gb2312"},function(err,res,body){
		request({encoding:null,url:"http://www.ne.qdedu.net/index.aspx?pkId=7203"},function(err,res,body){
			if (!err && res.statusCode == 200){
				body = iconv.decode(body,'gb2312').toString();
				var $ = cheerio.load(body);
				var list = [];
				debugger;
				$("a.news").each(function(){
					console.log(this);
					if (this.attribs){
						//this.attribs.title2 = iconv.decode(this.attribs.title,"gb2312");
						list.push(this.attribs);
					}
				});
				response.json(list);
			}
		});
	})
}