var path = require('path');
var express = require('express');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongo = require("mongoose");
var config = require('./config');
var flash = require('connect-flash');
var fs = require("fs");


mongo.connect(config.mongo);

/*
var model_path = __dirname + "\\models";
console.log(model_path);
fs.readdirSync(model_path ,function(err,files){
	console.log(err);
	for(var i=0;i<files.length;i++){
		console.log(file);
		if (~file.indexOf('.js')){
			require("./models/"+file);
		}
	}
});
*/

//console.log(process.env);

var Users =require("./models/users");
require("./models/posts");

debugger;

/*
var users = new Users();
users.user = {name:'micheal',email:'a@a.com'};
users.save(function(err){
	console.log(err);
});
*/

/*

mongo.model("users").collection.insert({name:'micheal',email:'a@a.com'});
mongo.model("users").find({},function(err,users){
	for(var user in users){
		console.dir(user);
	}
});
*/



var session = require('express-session');
var MongoStore = require('connect-mongodb-session')(session);

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

var store = new MongoStore({
	uri: config.mongo,
	collection:"mySessions"
});
var settings = config.session;
settings.store = store;
app.use(session(settings));

app.use(flash());
app.use(express.static(path.join(__dirname, 'bower_components')));  //normal way to develop
//app.use(express.static(path.join(__dirname, 'public'))); //only html and javascript, no template need.


var route = require('./routes/index');
route(app);

app.listen(process.env.PORT || config.app, function () {
  console.log('Website <<Thoughts>> listening on port ' + (process.env.PORT || config.app));
});