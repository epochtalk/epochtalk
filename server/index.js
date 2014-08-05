/* jshint node: true */
'use strict';

var path = require('path');
var Hapi = require('hapi');
var good = require('good');
var config = require(__dirname + '/config');

var serverOpts = {
  // cors disabled by default
  // CSP?
  security: {
    hsts: true,
    xframe: true,
    xss: true,
    noOpen: true,
    noSniff: true
  },
  files: {
    relativeTo: path.join(__dirname, "../public")
  }
};

var server = Hapi.createServer('localhost', config.port, serverOpts);
var routes = require(__dirname + '/routes');
server.route(routes.endpoints());

// server auth
//server.auth.scheme();
// server.auth.strategy

// server caching
// server.cache

server.pack.register(good, function (err) {
  if (err) {throw err; /* error loading the plugin */ }

  // start server
  server.start(function () {
    server.log('debug', 'config: ' + JSON.stringify(config, undefined, 2));
    server.log('info', 'Epochtalk Frontend server started @' + server.info.uri);
  });
});

// debug: print routes
// var table = server.table();
// console.log(table);
