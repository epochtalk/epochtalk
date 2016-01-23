require('dotenv').load();
var path = require('path');
var Hapi = require('hapi');
var Hoek = require('hoek');
var Good = require('good');
var Inert = require('inert');
var Vision = require('vision');
var mkdirp = require('mkdirp');
var GoodFile = require('good-file');
var GoodConsole = require('good-console');
var db = require(path.normalize(__dirname + '/../db'));
var redis = require(path.normalize(__dirname + '/../redis'));
var setup = require(path.normalize(__dirname + '/../setup'));
var config = require(path.normalize(__dirname + '/../config'));
var Auth = require(path.normalize(__dirname + '/plugins/jwt'));
var acls = require(path.normalize(__dirname + '/plugins/acls'));
var limiter = require(path.normalize(__dirname + '/plugins/limiter'));
var blacklist = require(path.normalize(__dirname + '/plugins/blacklist'));
var serverOptions = require(path.normalize(__dirname + '/server-options'));
var AuthValidate = require(path.normalize(__dirname + '/plugins/jwt/validate'));
var defaultRegisterCb = function(err) { if (err) throw(err); };

setup()
.then(function() {
  // create server object
  var server = new Hapi.Server();
  server.connection(serverOptions);

  // DB decoration
  server.decorate('request', 'db', db);
  server.decorate('request', 'redis', redis);

  // server logging only registered if config enabled
  var options = {};
  if (config.logEnabled) {
    var opsPath = path.normalize(__dirname +  '/../logs/server/operations');
    var errsPath = path.normalize(__dirname + '/../logs/server/errors');
    var reqsPath = path.normalize(__dirname + '/../logs/server/requests');
    var logsPath = path.normalize(__dirname + '/../logs/server/logs');
    mkdirp.sync(opsPath);
    mkdirp.sync(errsPath);
    mkdirp.sync(reqsPath);
    mkdirp.sync(logsPath);
    var configWithPath = function(path) {
      return { path: path, extension: 'log', rotate: 'daily', format: 'YYYY-MM-DD-X', prefix:'epochtalk' };
    };
    var consoleReporter = new GoodConsole({ log: '*', response: '*', error: '*' });
    var opsReporter = new GoodFile(configWithPath(opsPath), { ops: '*' });
    var errsReporter = new GoodFile(configWithPath(errsPath), { error: '*' });
    var reqsReporter = new GoodFile(configWithPath(reqsPath), { response: '*' });
    var logsReporter = new GoodFile(configWithPath(logsPath), { log: '*' });
    options.reporters = [ consoleReporter, opsReporter, errsReporter, reqsReporter, logsReporter ];
    server.register({ register: Good, options: options}, defaultRegisterCb);
  }

  // auth via jwt
  var authOptions = { redis: redis };
  server.register({ register: Auth, options: authOptions }, function(err) {
    if (err) throw err;
    var strategyOptions = {
      key: config.privateKey,
      validateFunc: AuthValidate
    };
    server.auth.strategy('jwt', 'jwt', strategyOptions);
  });

  // vision templating
  server.register(Vision, (err) => {
    if (err) { throw err; }

    // render views
    server.views({
      engines: { html: require('handlebars') },
      path: path.normalize(__dirname + '/../') + 'public'
    });
  });

  // inert static file serving
  server.register(Inert, defaultRegisterCb);

  // route acls
  var aclOptions = { db: db, config: config };
  server.register({register: acls, options: aclOptions }, defaultRegisterCb);

  // blacklist
  var blacklistOptions = { db: db };
  server.register({ register: blacklist, options: blacklistOptions }, defaultRegisterCb);

  // rate limiter
  var rlOptions = Hoek.clone(config.rateLimiting);
  rlOptions.redis = redis;
  server.register({ register: limiter, options: rlOptions }, defaultRegisterCb);

  // server routes
  var routes = require(path.normalize(__dirname + '/routes'));
  server.route(routes.endpoints());

  // start server
  server.start(function () {
    var configClone = Hoek.clone(config);
    configClone.privateKey = configClone.privateKey.replace(/./g, '*');
    configClone.emailer.pass = configClone.emailer.pass.replace(/./g, '*');
    configClone.images.s3.accessKey = configClone.images.s3.accessKey.replace(/./g, '*');
    configClone.images.s3.secretKey = configClone.images.s3.secretKey.replace(/./g, '*');
    server.log('debug', 'config: ' + JSON.stringify(configClone, undefined, 2));
    server.log('info', 'Epochtalk Frontend server started @' + server.info.uri);
  });
});
