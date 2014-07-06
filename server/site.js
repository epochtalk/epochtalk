'use strict';
var config = require('./config');
var express = require('express');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');
var passport = require(__dirname + '/passport');

var app = express();
app.use(methodOverride());
app.use(cookieParser('epoch'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ store: new RedisStore({
  host: config.redis.host,
  port: config.redis.port
}), secret: 'epoch' }));
app.use(passport.initialize());
app.use(passport.session());

var engines = require('consolidate');
var routes = require('./routes')(app);

app.engine('haml', engines.haml);
app.set('view engine', 'haml');
app.set('views', __dirname + '/views');


var env = process.env.NODE_ENV || 'development';
if ('development' === env) {
  app.use(morgan('dev'));
}
else {
  app.use(morgan());
}


module.exports = app;
