require('dotenv').load();
var path = require('path');
var Hapi = require('hapi');
var Hoek = require('hoek');
var Good = require('good');
var Inert = require('inert');
var Vision = require('vision');
var GoodFile = require('good-file');
var GoodConsole = require('good-console');
var db = require(path.normalize(__dirname + '/../db'));
var redis = require(path.normalize(__dirname + '/../redis'));
var setup = require(path.normalize(__dirname + '/../setup'));
var jwt = require(path.normalize(__dirname + '/plugins/jwt'));
var config = require(path.normalize(__dirname + '/../config'));
var acls = require(path.normalize(__dirname + '/plugins/acls'));
var hooks = require(path.normalize(__dirname + '/plugins/hooks'));
var parser = require(path.normalize(__dirname + '/plugins/parser'));
var common = require(path.normalize(__dirname + '/plugins/common'));
var emailer = require(path.normalize(__dirname + '/plugins/emailer'));
var modules = require(path.normalize(__dirname + '/plugins/modules'));
var session = require(path.normalize(__dirname + '/plugins/session'));
var limiter = require(path.normalize(__dirname + '/plugins/limiter'));
var patroller = require(path.normalize(__dirname + '/plugins/patroller'));
var blacklist = require(path.normalize(__dirname + '/plugins/blacklist'));
var sanitizer = require(path.normalize(__dirname + '/plugins/sanitizer'));
var serverOptions = require(path.normalize(__dirname + '/server-options'));
var imageStore = require(path.normalize(__dirname + '/plugins/imageStore'));
var AuthValidate = require(path.normalize(__dirname + '/plugins/jwt/validate'));
var authorization = require(path.normalize(__dirname + '/plugins/authorization'));
var notifications = require(path.normalize(__dirname + '/plugins/notifications'));
var moderationLog = require(path.normalize(__dirname + '/plugins/moderation_log'));
var trackIp = require(path.normalize(__dirname + '/plugins/track_ip'));

var server, additionalRoutes, commonMethods, authMethods, permissions, roles, hookMethods;

// setup configration file and sync with DB
setup()
// create server instance and add dbs
.then(function() {
  // create server object
  server = new Hapi.Server();
  server.connection(serverOptions);

  // config decoration
  server.app.config = config;

  // DB decoration
  server.decorate('request', 'db', db);
  server.decorate('server', 'db', db);
  server.decorate('request', 'redis', redis);
  server.decorate('server', 'redis', redis);
})
// server logging
.then(function() {
  // server logging only registered if config enabled
  if (config.logEnabled) {
    var configWithPath = function(path) {
      return { path: path, extension: 'log', rotate: 'daily', format: 'YYYY-MM-DD-X', prefix:'epochtalk' };
    };
    var options = {
      reporters: [
        {
          reporter: GoodConsole,
          events: { log: '*', response: '*', error: '*' }
        },
        {
          reporter: GoodFile,
          events: { ops: '*' },
          config: configWithPath(path.normalize(__dirname +  '/../logs/server/operations'))
        },
        {
          reporter: GoodFile,
          events: { error: '*' },
          config: configWithPath(path.normalize(__dirname + '/../logs/server/errors'))
        },
        {
          reporter: GoodFile,
          events: { response: '*' },
          config: configWithPath(path.normalize(__dirname + '/../logs/server/requests'))
        },
        {
          reporter: GoodFile,
          events: { log: '*' },
          config: configWithPath(path.normalize(__dirname + '/../logs/server/logs'))
        }
      ]
    };
    return server.register({ register: Good, options: options});
  }
})
// notifications
.then(function() {
  // notification methods
  return server.register({ register: notifications, options: { db, config }});
})
// auth via jwt
.then(function() {
  return server.register({ register: jwt, options: { redis } })
  .then(function() {
    var strategyOptions = {
      key: config.privateKey,
      validateFunc: AuthValidate
    };
    server.auth.strategy('jwt', 'jwt', strategyOptions);
  });
})
// blacklist
.then(function() { return server.register({ register: blacklist, options: { db } }); })
// rate limiter
.then(function() {
  var rlOptions = Hoek.clone(config.rateLimiting);
  rlOptions.redis = redis;
  return server.register({ register: limiter, options: rlOptions });
})
// imageStore
.then(function() { return server.register({ register: imageStore, options: { config, db } }); })
// sanitizer
.then(function() { return server.register({ register: sanitizer }); })
// parser
.then(function() { return server.register({ register: parser }); })
// load modules
.then(function() {
  return server.register({ register: modules, options: { db } })
  .then(function(output) {
    additionalRoutes = output.routes;
    commonMethods = output.common;
    authMethods = output.authorization;
    permissions = output.permissions;
    hookMethods = output.hooks;
  });
})
// route acls
.then(function() {
  return server.register({register: acls, options: { db, config, permissions } })
  .then(function(output) { roles = output; });
})
// user sessions
.then(function() {
  return server.register({ register: session, options: { roles, redis, config } });
})
// common methods
.then(function() {
  return server.register({ register: common, options: { methods: commonMethods } });
})
// authorization methods
.then(function() {
  return server.register({ register: authorization, options: { methods: authMethods } });
})
// hook methods
.then(function() {
  return server.register({ register: hooks, options: { hooks: hookMethods } });
})
// vision templating
.then(function() {
  return server.register(Vision)
  .then(function() {
    // render views
    server.views({
      engines: { html: require('handlebars') },
      path: path.normalize(__dirname + '/../') + 'public'
    });
  });
})
// inert static file serving
.then(function() { return server.register(Inert); })
// emailer
.then(function() { server.register({ register: emailer, options: { config } }); })
// moderation log
.then(function() { server.register({ register: moderationLog, options: { db } }); })
// Track IP
.then(function() { server.register({ register: trackIp, options: { db } }); })
// Patrollers
.then(function() { server.register({ register: patroller }); })
// routes and server start
.then(function() {
  // server routes
  var routes = require(path.normalize(__dirname + '/routes'));
  var allRoutes = routes.endpoints(config);
  allRoutes = allRoutes.concat(additionalRoutes);
  server.route(allRoutes);

  // start server
  server.start(function () {
    var configClone = Hoek.clone(config);
    configClone.privateKey = configClone.privateKey.replace(/./g, '*');
    configClone.emailer.pass = configClone.emailer.pass.replace(/./g, '*');
    configClone.images.s3.accessKey = configClone.images.s3.accessKey.replace(/./g, '*');
    configClone.images.s3.secretKey = configClone.images.s3.secretKey.replace(/./g, '*');
    server.log('debug', 'DB Connection: ' + process.env.DATABASE_URL);
    server.log('debug', 'config: ' + JSON.stringify(configClone, undefined, 2));
    server.log('info', 'Epochtalk Frontend server started @' + server.info.uri);
  });
});
