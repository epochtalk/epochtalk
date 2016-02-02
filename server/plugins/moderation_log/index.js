var db;
var path = require('path');
var Promise = require('bluebird');
var _ = require('lodash');
var templates = require(path.normalize(__dirname + '/templates'));

exports.register = function(server, options, next) {
  if (!options.db) { return next(new Error('No DB found in Moderation Log')); }
  db = options.db;

  server.ext('onPostHandler', function(request, reply) {
    reply.continue();

    var modLog = _.get(request, 'route.settings.plugins.mod_log');
    var actionTemplate;
    if (modLog) { actionTemplate = templates[modLog.type]; }

    if (actionTemplate) {
      // Log object to store
      var log = {};

      // Build moderator user object
      log.moderator = {
        username: request.auth.credentials.username,
        id: request.auth.credentials.id,
        ip: request.headers['x-forwarded-for'] || request.info.remoteAddress
      };

      // Build known action data
      log.action = {
        type: modLog.type,
        api_url: request.url.path,
        api_method: request.route.method,
        taken_at: new Date()
      };

      // Build action object from action object template
      log.action.obj = _.reduce(_.keys(modLog.data), function(o, key) {
        o[key] = _.get(request, modLog.data[key]);
        return o;
      }, {});

      // Generates display text from templates
      var generateDisplayInfo = function() {
        log.action.display_text = actionTemplate.genDisplayText(log.action.obj);
        log.action.display_url = actionTemplate.genDisplayUrl(log.action.obj);
      };

      // Store to db
      var storeToDb = function() { request.db.moderationLog.create(log); };

      // var storeToDb = request.db.moderationLog.create(log);

      // Determine if dataQuery is present
      var promise = Promise.resolve();
      if (actionTemplate.dataQuery) {
        promise = actionTemplate.dataQuery(log.action.obj, request);
      }

      // Execute dataQuery if present, generate display text, then write log to the db
      promise.then(function() { return generateDisplayInfo(); })
      .then(function() { return storeToDb(); })
      .catch(function(err) { if (err) { throw err; } });
    }
  });

  next();
};

exports.register.attributes = {
  name: 'mod_log',
  version: '1.0.0'
};
