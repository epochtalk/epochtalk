var path = require('path');
var Hapi = require('hapi');
var Good = require('good');
var mkdirp = require('mkdirp');
var GoodFile = require('good-file');
var GoodConsole = require('good-console');
var methods = require(path.normalize(__dirname + '/methods'));
var Auth = require(path.normalize(__dirname + '/plugins/jwt'));
var config = require(path.normalize(__dirname + '/../config'));
var serverOptions = require(path.normalize(__dirname + '/server-options'));
var AuthValidate = require(path.normalize(__dirname + '/plugins/jwt/validate'));
var server = new Hapi.Server();
var connection = server.connection(serverOptions);

var defaultRegisterCb = function(err) { if (err) throw(err); };

// logging only regiestered if config enabled
var options = {};
if (config.logEnabled) {
  var opsPath = path.normalize(__dirname +  '/../logs/server/operations');
  var errsPath = path.normalize(__dirname + '/../logs/server/errors');
  var reqsPath = path.normalize(__dirname + '/../logs/server/requests');
  mkdirp.sync(opsPath);
  mkdirp.sync(errsPath);
  mkdirp.sync(reqsPath);
  var configWithPath = function(path) {
    return { path: path, extension: 'log', rotate: 'daily', format: 'YYYY-MM-DD-X', prefix:'epochtalk' };
  };
  var consoleReporter = new GoodConsole({ log: '*', response: '*' });
  var opsReporter = new GoodFile(configWithPath(opsPath), { log: '*', ops: '*' });
  var errsReporter = new GoodFile(configWithPath(errsPath), { log: '*', error: '*' });
  var reqsReporter = new GoodFile(configWithPath(reqsPath), { log: '*', response: '*' });
  options.reporters = [ consoleReporter, opsReporter, errsReporter, reqsReporter ];
  server.register({ register: Good, options: options}, defaultRegisterCb);
}

// auth via jwt
server.register(Auth, function(err) {
  if (err) throw err;
  var strategyOptions = {
    key: config.privateKey,
    validateFunc: AuthValidate
  };
  server.auth.strategy('jwt', 'jwt', strategyOptions);
});

// server routes
var routes = require(path.normalize(__dirname + '/routes'));
server.route(routes.endpoints());

// server methods
server.method(methods);

// lout for api documentation
server.register({ register: require('lout') }, defaultRegisterCb);

server.start(function () {
  var configCopy = config;
  configCopy.emailer.pass = configCopy.emailer.pass.replace(/./g, '*');
  server.log('debug', 'config: ' + JSON.stringify(configCopy, undefined, 2));
  server.log('info', 'Epochtalk Frontend server started @' + server.info.uri);
});
