require('dotenv').load();
var _ = require('lodash');
var path = require('path');
var Hapi = require('hapi');
var Good = require('good');
var mkdirp = require('mkdirp');
var GoodFile = require('good-file');
var GoodConsole = require('good-console');
var Auth = require(path.normalize(__dirname + '/plugins/jwt'));
var acls = require(path.normalize(__dirname + '/plugins/acls'));
var config = require(path.normalize(__dirname + '/../config'));
var serverOptions = require(path.normalize(__dirname + '/server-options'));
var AuthValidate = require(path.normalize(__dirname + '/plugins/jwt/validate'));
var defaultRegisterCb = function(err) { if (err) throw(err); };
var setup = require(path.normalize(__dirname + '/../setup'));
var plugins = require(path.normalize(__dirname + '/../plugins'));

setup()
.then(plugins.bootstrap)
.then(function(pluginRoutes) {
  // create server object
  var server = new Hapi.Server();
  server.connection(serverOptions);

  // server logging only registered if config enabled
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
  // route acls
  server.register(acls, defaultRegisterCb);

  // render views
  server.views({
    engines: { html: require('handlebars') },
    relativeTo: path.normalize(__dirname + '/../'),
    path: 'public'
  });

  // server routes
  var routes = require(path.normalize(__dirname + '/routes'));
  var allRoutes = pluginRoutes.concat(routes.endpoints());
  server.route(allRoutes);

  // start server
  server.start(function () {
    var configClone = _.cloneDeep(config);
    configClone.privateKey = configClone.privateKey.replace(/./g, '*');
    configClone.emailer.pass = configClone.emailer.pass.replace(/./g, '*');
    configClone.images.s3.accessKey = configClone.images.s3.accessKey.replace(/./g, '*');
    configClone.images.s3.secretKey = configClone.images.s3.secretKey.replace(/./g, '*');
    server.log('debug', 'config: ' + JSON.stringify(configClone, undefined, 2));
    server.log('info', 'Epochtalk Frontend server started @' + server.info.uri);
  });
});
