'use strict';
var config = require('./config');
var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

var app = express();
var engines = require('consolidate');
var db = require('./db');
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

app.use(bodyParser());
app.use(methodOverride());

module.exports = app;
