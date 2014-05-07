'use strict';
var express = require('express');
var RedisStore = require('connect-redis')(express);
var config = require('./config');
var app = express();
var engines = require('consolidate');
var db = require('./db');
var routes = require('./routes')(app);

app.engine('haml', engines.haml);
app.set('view engine', 'haml');
app.set('views', __dirname + '/views');
app.use('/', express.static(config.root + '/public'));
app.use(express.logger('dev'));
app.use(express.cookieParser('adness'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.json());
app.use(express.urlencoded());
app.use(express.session({
  store: new RedisStore({
    host: config.redis.host,
    port: config.redis.port,
  }),
  cookie: {
    secure: false,
    maxAge:86400000
  }
}));

module.exports = app;
