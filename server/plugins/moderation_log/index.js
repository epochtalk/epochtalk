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

    var modLog = _.get(request, 'route.settings.app.mod_log');
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

      // Build actionObj from action object template
      log.actionObj = _.reduce(_.keys(modLog.data), function(o, key) {
        o[key] = _.get(request, modLog.data[key]);
        return o;
      }, {});
      log.actionObj = _.isEmpty(log.actionObj) ? null : log.actionObj;

      // Generates display text from templates
      var generateDisplayInfo = function() {
        log.displayText = actionTemplate.genDisplayText(log.actionObj);
        log.displayUrl = actionTemplate.genDisplayUrl(log.actionObj);
      };

      // Store to db
      var storeToDb = function() {
        console.log(JSON.stringify(log, null, 2));
      };
      // var storeToDb = request.db.moderationLog.create(log);

      // Determine if dataQuery is present
      var promise = Promise.resolve();
      if (actionTemplate.dataQuery) {
        promise = actionTemplate.dataQuery(log.actionObj, request);
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
  name: 'moderation-log',
  version: '1.0.0'
};
