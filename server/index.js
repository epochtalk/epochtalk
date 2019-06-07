require('dotenv').load({silent: true});
var _ = require('lodash');
var Promise = require('bluebird');
var path = require('path');
var Hapi = require('hapi');
var Hoek = require('hoek');
var websocketServer = require(path.normalize(__dirname + '/../websocket-server'));
var Good = require('good');
var Inert = require('inert');
var Vision = require('vision');
var errorMap = require(path.normalize(__dirname + '/error-map'));
var db = require(path.normalize(__dirname + '/../db'));
var redis = require(path.normalize(__dirname + '/../redis'));
var setup = require(path.normalize(__dirname + '/../setup'));
var jwt = require(path.normalize(__dirname + '/plugins/jwt'));
var config = require(path.normalize(__dirname + '/../config'));
var acls = require(path.normalize(__dirname + '/plugins/acls'));
var hooks = require(path.normalize(__dirname + '/plugins/hooks'));
var parser = require(path.normalize(__dirname + '/plugins/parser'));
var common = require(path.normalize(__dirname + '/plugins/common'));
var backoff = require(path.normalize(__dirname + '/plugins/backoff'));
var emailer = require(path.normalize(__dirname + '/plugins/emailer'));
var modules = require(path.normalize(__dirname + '/plugins/modules'));
var session = require(path.normalize(__dirname + '/plugins/session'));
var limiter = require(path.normalize(__dirname + '/plugins/limiter'));
var sanitizer = require(path.normalize(__dirname + '/plugins/sanitizer'));
var serverOptions = require(path.normalize(__dirname + '/server-options'));
var logOptions = require(path.normalize(__dirname + '/log-options'));
var lastActive = require(path.normalize(__dirname + '/plugins/last_active'));
var AuthValidate = require(path.normalize(__dirname + '/plugins/jwt/validate'));
var authorization = require(path.normalize(__dirname + '/plugins/authorization'));
var notifications = require(path.normalize(__dirname + '/plugins/notifications'));
var trackIp = require(path.normalize(__dirname + '/plugins/track_ip'));

var server, additionalRoutes, commonMethods, authMethods, permissions, roles, hookMethods, plugins, parsers;

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
  server.decorate('request', 'errorMap', errorMap);
  server.decorate('request', 'redis', redis);

  server.decorate('server', 'db', db);
  server.decorate('server', 'errorMap', errorMap);
  server.decorate('server', 'redis', redis);

})
// server logging
.then(function() {
  // server logging only registered if config enabled
  return server.register({ register: Good, options: logOptions});
})
// inert static file serving
.then(function() { server.register(Inert); })
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
// backoff
.then(function() { return server.register({ register: backoff }); })
// rate limiter
.then(function() {
  var rlOptions = Hoek.clone(config.rateLimiting);
  rlOptions.redis = redis;
  return server.register({ register: limiter, options: rlOptions });
})
// sanitizer
.then(function() { return server.register({ register: sanitizer }); })
// load modules
.then(function() {
  return server.register({ register: modules, options: { db } })
  .then(function() {
    additionalRoutes = server.app.moduleData.routes;
    commonMethods = server.app.moduleData.common;
    authMethods = server.app.moduleData.authorization;
    permissions = server.app.moduleData.permissions;
    hookMethods = server.app.moduleData.hooks;
    plugins = server.app.moduleData.plugins;
    parsers = server.app.moduleData.parsers;
    delete server.app.moduleData;
    return;
  });
})
// parser
.then(function() { return server.register({ register: parser, options: { parsers } }); })
// route acls
.then(function() {
  return server.register({ register: acls, options: { db, config, permissions } })
  .then(function() {
    roles = server.app.rolesData;
    delete server.app.rolesData;
    return;
  });
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
// plugins methods
.then(function() {
  return Promise.each(plugins, function(plugin) {
    if (plugin.db) {
      plugin.options = Object.assign(plugin.options || {}, { db });
      delete plugin.db;
    }
    if (plugin.config) {
      plugin.options = Object.assign(plugin.options || {}, { config });
      delete plugin.config;
    }
    server.register(plugin);
  });
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
// emailer
.then(function() { return server.register({ register: emailer, options: { config } }); })
// Track IP
.then(function() { return server.register({ register: trackIp, options: { db } }); })
// Last Active
.then(function() { return server.register({ register: lastActive }); })
// Start websocket server
.then(function() {
  if (config.disable_websocket_server) {
    return;
  }
  else {
    return websocketServer.start();
  }
})
// routes and server start
.then(function() {
  // server routes
  var routes = require(path.normalize(__dirname + '/routes'));
  var allRoutes = routes.endpoints(config);
  allRoutes = allRoutes.concat(additionalRoutes);
  server.route(allRoutes);

  // start server
  return server.start(function () {
    var configClone = Hoek.clone(config);
    configClone.privateKey = configClone.privateKey.replace(/./g, '*');
    if (_.get(configClone, 'emailer.options.accessKeyId')) { configClone.emailer.options.accessKeyId = configClone.emailer.options.accessKeyId.replace(/./g, '*'); }
    if (_.get(configClone, 'emailer.options.secretAccessKey')) { configClone.emailer.options.secretAccessKey = configClone.emailer.options.secretAccessKey.replace(/./g, '*'); }
    if (_.get(configClone, 'emailer.options.auth.pass')) { configClone.emailer.options.auth.pass = configClone.emailer.options.auth.pass.replace(/./g, '*'); }
    if (configClone.images.s3.accessKey) { configClone.images.s3.accessKey = configClone.images.s3.accessKey.replace(/./g, '*'); }
    if (configClone.images.s3.secretKey) { configClone.images.s3.secretKey = configClone.images.s3.secretKey.replace(/./g, '*'); }
    if (configClone.imagesEnv.s3.accessKey) { configClone.imagesEnv.s3.accessKey = configClone.imagesEnv.s3.accessKey.replace(/./g, '*'); }
    if (configClone.imagesEnv.s3.secretKey) { configClone.imagesEnv.s3.secretKey = configClone.imagesEnv.s3.secretKey.replace(/./g, '*'); }
    if (configClone.recaptchaSiteKey) { configClone.recaptchaSiteKey = configClone.recaptchaSiteKey.replace(/./g, '*'); }
    if (configClone.recaptchaSecretKey) { configClone.recaptchaSecretKey = configClone.recaptchaSecretKey.replace(/./g, '*'); }
    if (configClone.gaKey) { configClone.gaKey = configClone.gaKey.replace(/./g, '*'); }
    if (configClone.websocketAPIKey) { configClone.websocketAPIKey = configClone.websocketAPIKey.replace(/./g, '*'); }
    var dbCon = {
      database: process.env.PGDATABASE,
      host: process.env.PGHOST,
      port: process.env.PGPORT,
      username: process.env.PGUSER,
      password: process.env.PGPASSWORD.replace(/./g, '*')
    };
    server.log('debug', '\nDB Connection:\n' + JSON.stringify(dbCon, undefined, 2));
    server.log('debug', '\nServer Configurations:\n' + JSON.stringify(configClone, undefined, 2));
    server.log('info', 'Epochtalk Frontend server started @' + server.info.uri);
  });

  // listen on SIGINT signal and gracefully stop the server
  process.on('SIGINT', function () {
    console.log('Shutting down server');
    server.stop({ timeout: 10000 })
    .then(db.close) // end connection with db pool
    .then(function (err) {
      console.log('Server has stopped');
      process.exit((err) ? 1 : 0);
    });
  });
})
.catch(function(err) {
  console.error(err);
  process.exit(1);
});
