var express = require('express');
var config = require(__dirname + '/../config');
var db = require(__dirname + '/../db');
var api = require(__dirname + '/api');

var configureRoutes = function(app) {
  app.use('/', express.static(config.root + '/public'));
  app.use('/api', api);
  app.get('*', function(req, res){
    return res.sendfile('index.html', {root: './public'});
  });
}

module.exports = configureRoutes;
