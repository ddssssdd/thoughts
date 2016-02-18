var path = require('path');
var express = require('express');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongo = require("mongoose");
var config = require('./config');
var flash = require('connect-flash');

 


mongo.connect(config.mongo);
//mongo.set("debug",true);

config.base_folder = __dirname;

require("./auto_load")(config);


//console.log(process.env);
/*
var Users =require("./models/users");
require("./models/posts");
require("./models/uploads");
require("./models/attachments");
*/


var session = require('express-session');
var MongoStore = require('connect-mongodb-session')(session);

var app = express();
app.config = config;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.engine('html', require('ejs').renderFile);

app.use(favicon(__dirname + '/public/favicon.ico'));

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb',extended: true }));
app.use(cookieParser());

var store = new MongoStore({
	uri: config.mongo,
	collection:"mySessions"
});
var settings = config.session;
settings.store = store;
app.use(session(settings));


app.use(flash());
//app.use(express.static(path.join(__dirname, 'bower_components')));  //normal way to develop
//app.use(express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));
//app.use(express.static(path.join(__dirname, 'public'))); //only html and javascript, no template need.

app.use(logger('dev'));
/*
var getRawBody = require('raw-body')
var typer = require('media-typer')

app.use(function (req, res, next) {
  getRawBody(req, {
    length: req.headers['content-length'],
    limit: '1000mb',
    //encoding: 'utf-8'//typer.parse(req.headers['content-type']).parameters.charset
  }, function (err, string) {
    if (err) return next(err)
    req.text = string
    next()
  })
})
*/
app.use(function (req,res,next){
	require("./common/log")(req);
	next();
});
app.use("/users",require("./routes/users"));

app.use(require("./middleware/security"));
var route = require('./routes/index');
route(app);


app.use("/posts",require("./routes/posts"));
app.use("/projects",require("./routes/projects"));
app.use("/spiders",require("./routes/spiders"));
app.use("/bing", require("./routes/bing.js"));
app.use("/admin", require("./routes/admin.js"));

app.listen(process.env.PORT || config.app, function () {
  console.log('Website <<Thoughts>> listening on port ' + (process.env.PORT || config.app));
});