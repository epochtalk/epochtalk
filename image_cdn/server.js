/* jshint node: true */
'use strict';

var path = require('path');
var Hapi = require('hapi');
var good = require('good');
var mkdirp = require('mkdirp');
var config = require(path.join(__dirname, 'config'));

// server caching
// server.cache
var serverOpts = {
  // cors disabled by default
  security: {
    hsts: true,
    xframe: true,
    xss: true,
    noOpen: true,
    noSniff: true
  }
};
var server = Hapi.createServer('localhost', config.port, serverOpts);

// api routes
var routes = require(__dirname + '/routes');
server.route(routes.endpoints());

// check if logging is enabled
var options = {};
if (config.logEnabled) {
  mkdirp.sync('./logs/server/operations');
  mkdirp.sync('./logs/server/errors');
  mkdirp.sync('./logs/server/requests');
  var logOpts = { extension: 'log', rotationTime: 1, format: 'YYYY-MM-DD-X' };
  options.reporters = [
    { reporter: require('good-console'), args:[{ log: '*', request: '*', error: '*' }] },
    { reporter: require('good-file'), args: ['./logs/server/operations/', { ops: '*' }, logOpts] },
    { reporter: require('good-file'), args: ['./logs/server/errors/', { error: '*' }, logOpts] },
    { reporter: require('good-file'), args: ['./logs/server/requests/', { request: '*' }, logOpts] }
  ];
}

// register server route logging
server.pack.register({ plugin: good, options: options}, function (err) {
  if (err) { throw err; /* error loading the plugin */  }
});

// start server
server.start(function () {
  server.log('debug', 'config: ' + JSON.stringify(config, undefined, 2));
  server.log('info', 'Epochtalk Frontend server started @' + server.info.uri);
});
