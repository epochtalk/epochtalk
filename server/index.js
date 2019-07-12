require('dotenv').load({silent: true});
var _ = require('lodash');
var Promise = require('bluebird');
var path = require('path');
var Hapi = require('@hapi/hapi');
var Hoek = require('hoek');
var websocketServer = require(path.normalize(__dirname + '/../websocket-server'));
var Good = require('@hapi/good');
var Inert = require('@hapi/inert');
var Vision = require('@hapi/vision');
var errorMap = require(path.normalize(__dirname + '/error-map'));
var db = require(path.normalize(__dirname + '/../db'));
var websocket = require(path.normalize(__dirname + '/../websocket'));
var redis = require(path.normalize(__dirname + '/../redis'));
var setup = require(path.normalize(__dirname + '/../setup'));
var jwt = require(path.normalize(__dirname + '/plugins/jwt'));
var config = require(path.normalize(__dirname + '/../config'));
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
var AuthValidate = require(path.normalize(__dirname + '/plugins/jwt/validate'));

var server, additionalRoutes, commonMethods, authMethods, permissions, roles, hookMethods, plugins, parsers;

// setup configration file and sync with DB
setup()
// create server instance and add dbs
.then(function() {
  // create server object
  server = Hapi.Server(serverOptions);

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
// Load plugins which are npm deps
// server logging
.then(function() {
  // server logging only registered if config enabled
  return server.register({ plugin: Good, options: logOptions});
})
// inert static file serving
.then(function() { server.register(Inert); })
// auth via jwt
.then(function() {
  return server.register({ plugin: jwt, options: { redis } })
  .then(function() {
    var strategyOptions = {
      key: config.privateKey,
      validateFunc: AuthValidate
    };
    server.auth.strategy('jwt', 'jwt', strategyOptions);
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
// register modules plugin to grab plugin data
.then(function() {
  return server.register({ plugin: modules, options: { db, config } })
  .then(function() {
    additionalRoutes = server.app.moduleData.routes;
    commonMethods = server.app.moduleData.common;
    authMethods = server.app.moduleData.authorization;
    permissions = server.app.moduleData.permissions;
    hookMethods = server.app.moduleData.hooks;
    preloadPlugins = server.app.moduleData.plugins.filter(function(e) { return e.preload; });
    plugins = server.app.moduleData.plugins.filter(function(e) { return !e.preload; });
    parsers = server.app.moduleData.parsers;
    return;
  });
})
// preload special case module plugins which need to be loaded first
.then(function() { return loadModulePlugins(preloadPlugins) })
// Clean up data temporarily appended to server after modules are loaded
.then(function() {
  roles = server.app.rolesData;
  delete server.app.rolesData;
  delete server.app.moduleData;
  return;
})
// Load non-module plugins
// backoff
.then(function() { return server.register({ plugin: backoff }); })
// rate limiter
.then(function() {
  var rlOptions = Hoek.clone(config.rateLimiting);
  rlOptions.redis = redis;
  return server.register({ plugin: limiter, options: rlOptions });
})
// sanitizer
.then(function() { return server.register({ register: sanitizer }); })
// parser
.then(function() { return server.register({ plugin: parser, options: { parsers } }); })
// user sessions
.then(function() {
  return server.register({ register: session, options: { roles, redis, config } });
})
// common methods
.then(function() {
  return server.register({ plugin: common, options: { methods: commonMethods } });
})
// hook methods
.then(function() {
  return server.register({ plugin: hooks, options: { hooks: hookMethods } });
})
// emailer
.then(function() { return server.register({ plugin: emailer, options: { config } }); })
// plugins methods
.then(function() {
  return loadModulePlugins(plugins);
})
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

function loadModulePlugins(plugs) {
  return Promise.each(plugs, function(plugin) {
    if (plugin.db) {
      _.set(plugin, ['options', 'db'], db);
      delete plugin.db;
    }
    if (plugin.websocket) {
      _.set(plugin, ['options', 'websocket'], websocket);
      delete plugin.websocket;
    }
    if (plugin.config) {
      _.set(plugin, ['options', 'config'], config);
      delete plugin.config;
    }
    if (plugin.permissions) {
      _.set(plugin, ['options', 'permissions'], permissions);
      delete plugin.permissions;
    }
    if (plugin.methods) {
      _.set(plugin, ['options', 'methods'], authMethods);
      delete plugin.methods;
    }
    return server.register(plugin);
  });
}
