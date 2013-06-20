
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var partials = require('express-partials');
var MongoStore = require('connect-mongo')(express);
var settings = require('./settings');
var flash= require('connect-flash');

var app = express();

// all environments
app.set('port', process.env.PORT || 9000);
app.set('views', __dirname + '/views');
//app.set('view engine', 'jade');
app.set('view engine', 'ejs');
app.use(partials());
app.use(flash());
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser({uploadDir:'./public/upload'}));
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({
	secret: settings.cookieSecret,
	store: new MongoStore({
		db: settings.db
	})
}));

app.configure(function(){
app.use(function(req, res, next){
	res.locals.user = req.session.user;
	next();
});
app.use(function(req, res, next){
	var err = req.flash('error');
	if (err.length)
		res.locals.error = err;
	else
		res.locals.error = null;
	next();
});

app.use(function(req, res, next){
	var succ = req.flash('success');
	if (succ.length)
		res.locals.success=succ;
	else
		res.locals.success=null;
	next();
});

});


app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

routes(app);



http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
