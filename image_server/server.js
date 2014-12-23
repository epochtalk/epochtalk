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
server.route(require(path.join(__dirname, 'routes')));

// check if logging is enabled
var options = {};
if (config.logEnabled) {
  mkdirp.sync('./logs/images/operations');
  mkdirp.sync('./logs/images/errors');
  mkdirp.sync('./logs/images/requests');
  var logOpts = { extension: 'log', rotationTime: 1, format: 'YYYY-MM-DD-X' };
  options.reporters = [
    { reporter: require('good-console'), args:[{ log: '*', request: '*', error: '*' }] },
    { reporter: require('good-file'), args: ['./logs/images/operations/', { ops: '*' }, logOpts] },
    { reporter: require('good-file'), args: ['./logs/images/errors/', { error: '*' }, logOpts] },
    { reporter: require('good-file'), args: ['./logs/images/requests/', { request: '*' }, logOpts] }
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
