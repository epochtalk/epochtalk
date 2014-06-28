var express = require('express');
var config = require(__dirname + '/../config');
var api = require(__dirname + '/api');
var qr = require('qr-image');

var configureRoutes = function(app) {
  app.get('/totp', function(req, res) {
    var code = qr.image('otpauth://totp/epochtalk?secret=' + req.user.totp_key.base32, { type: 'svg' });
    res.type('svg');
    return code.pipe(res);
  });

  app.use('/', express.static(config.root + '/public'));
  app.use('/api', api);
  app.get('*', function(req, res){
    return res.sendfile('index.html', {root: './public'});
  });
};

module.exports = configureRoutes;
