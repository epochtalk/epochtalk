var path = require('path');
var Hapi = require('hapi');
var Boom = require('boom');
var good = require('good');
var hapiAuthJwt = require('hapi-auth-jwt');
var jwt = require('jsonwebtoken');
var mkdirp = require('mkdirp');
var config = require(path.join(__dirname, '..', 'config'));
var serverOptions = require(path.join(__dirname, 'server-options'));

var server = new Hapi.Server();
var connection = server.connection(serverOptions);
server.route([{
  method: 'GET',
  path: '/static/{path*}',
  handler: {
    directory: {
      path: path.join(__dirname, '..', 'public'),
      index: false
    }
  }
},
// index page
{
  method: 'GET',
  path: '/{path*}',
  handler: {
    file: 'index.html'
  }
}]);

var defaultRegisterCb = function(err) { if (err) throw(err); };

// logging only regiestered if config enabled
var goodOpts = {};
if (config.logEnabled) {
  mkdirp.sync('./logs/server/operations');
  mkdirp.sync('./logs/server/errors');
  mkdirp.sync('./logs/server/requests');
  var logOpts = { extension: 'log', rotationTime: 1, format: 'YYYY-MM-DD-X' };
  goodOpts.reporters = [
    { reporter: require('good-console'), args:[{ log: '*', response: '*', error: '*' }] },
    { reporter: require('good-file'), args: ['./logs/server/operations/ops', { ops: '*' }, logOpts] },
    { reporter: require('good-file'), args: ['./logs/server/errors/errs', { error: '*' }, logOpts] },
    { reporter: require('good-file'), args: ['./logs/server/requests/reqs', { response: '*' }, logOpts] }
  ];
  server.register({ register: good, options: goodOpts}, defaultRegisterCb);
}
// auth via jwt
server.register(hapiAuthJwt, function(err) {
  if (err) throw err;
  var strategyOptions = {
    key: config.privateKey,
    validateFunc: require(path.join(__dirname, 'jwt-validate'))
  };
  server.auth.strategy('jwt', 'jwt', strategyOptions);
});
// api routes
var httpApiOpts = { config: config };
server.register({ register: require('epochtalk-http-api'), options: httpApiOpts }, defaultRegisterCb);
// lout for api documentation
server.register({ register: require('lout') }, defaultRegisterCb);

server.start(function () {
  server.log('debug', 'config: ' + JSON.stringify(config, undefined, 2));
  server.log('info', 'Epochtalk Frontend server started @' + server.info.uri);
});
