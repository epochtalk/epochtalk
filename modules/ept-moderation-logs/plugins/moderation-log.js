var _ = require('lodash');
var path = require('path');
var Promise = require('bluebird');
var templates = require(path.normalize(__dirname + '/templates'));
var db;


module.exports = {
  name: 'mod_log',
  version: '1.0.0',
  register: async function(server, options) {
    if (!options.db) { return new Error('No DB found in Moderation Log'); }
    db = options.db;

    server.ext('onPostHandler', function(request, reply) {
      // Only log successful actions
      if (request.response.statusCode === 200) {
        var modLog = _.get(request, 'route.settings.plugins.mod_log');
        var actionTemplate;
        if (modLog) { actionTemplate = templates[modLog.type]; }

        // double check routes available to both users and above
        var validRouteInstance = false;
        if (modLog && modLog.diffUser) {
          var diffUser = _.get(request, modLog.diffUser);
          if (request.auth.credentials.id !== diffUser) { validRouteInstance = true; }
        }
        else { validRouteInstance = true; }

        if (validRouteInstance && actionTemplate) {
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
            api_url: request.path,
            api_method: request.route.method,
            taken_at: new Date()
          };

          // Build action object from action object template
          log.action.obj = _.reduce(_.keys(modLog.data), function(o, key) {
            o[key] = _.get(request, modLog.data[key]);
            return o;
          }, {});

          var promise = Promise.resolve();
          if (actionTemplate.dataQuery) {
            promise = actionTemplate.dataQuery(log.action.obj, request);
          }

          // Execute dataQuery if present, generate display text, then write log to the db
          promise.then(function() {
            // Generates display text from templates
            log.action.display_text = actionTemplate.genDisplayText(log.action.obj);
            log.action.display_url = actionTemplate.genDisplayUrl(log.action.obj);
            // Store log to database
            return request.db.moderationLogs.create(log);
          })
          .catch(function(err) {
           if (err && err.code !== 'DONOTLOG') { throw err; }
         });
        }
      }
      return reply.continue;
    });
  }
};
