'use strict';
var config = require('./config');
var express = require('express');
var morgan  = require('morgan')
var app = express();
var engines = require('consolidate');
var db = require('./db');
var routes = require('./routes')(app);

app.engine('haml', engines.haml);
app.set('view engine', 'haml');
app.set('views', __dirname + '/views');

app.use('/', express.static(config.root + '/public'));

var env = process.env.NODE_ENV || 'development';
if ('development' == env) {
  app.use(morgan({ format: 'dev', immediate: true }));
}
else {
  app.use(morgan());
}
module.exports = app;
