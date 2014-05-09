'use strict';
var express = require('express');
var config = require('./config');
var app = express();
var engines = require('consolidate');
var db = require('./db');
var routes = require('./routes')(app);

app.engine('haml', engines.haml);
app.set('view engine', 'haml');
app.set('views', __dirname + '/views');
app.use('/', express.static(config.root + '/public'));


module.exports = app;
