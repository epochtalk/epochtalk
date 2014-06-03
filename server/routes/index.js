var express = require('express');
var config = require(__dirname + '/../config');
var db = require(__dirname + '/../db');
var api = require(__dirname + '/api');
var speakeasy = require('speakeasy');

var configureRoutes = function(app) {
  // totp test route
  app.get('/totp', function(req, res) {
    var totpKey = speakeasy.totp({key: 'SpWaxP[NvGW%gz>yB:lo'});
    return res.json({totp: totpKey});

  });

  app.use('/', express.static(config.root + '/public'));
  app.use('/api', api);
  app.get('*', function(req, res){
    return res.sendfile('index.html', {root: './public'});
  });
}

module.exports = configureRoutes;
