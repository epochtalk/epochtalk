var db;
var path = require('path');
var templates = require(path.normalize(__dirname + '/templates'));
var _ = require('lodash');

exports.register = function(server, options, next) {
  if (!options.db) { return next(new Error('No DB found in Moderation Log')); }
  db = options.db;

  server.ext('onPostHandler', function(request, reply) {
    reply.continue();
    var modLog = _.get(request, 'route.settings.app.mod_log');
    var actionTemplate;
    if (modLog) { actionTemplate = templates[modLog.type]; }

    if (actionTemplate) {
      // Build moderator user object
      var moderator = {
        username: request.auth.credentials.username,
        id: request.auth.credentials.id,
        ip: request.headers['x-forwarded-for'] || request.info.remoteAddress
      };

      // Build actionObj from action object template
      var actionObj = _.reduce(_.keys(modLog.data), function(o, key) {
        o[key] = _.get(request, modLog.data[key]);
        return o;
      }, {});

      // Generate Display Text and URL
      var displayText = actionTemplate.genDisplayText(actionObj);
      var displayUrl = actionTemplate.genDisplayUrl(actionObj);


      console.log('\n');
      console.log('Action Type:', modLog.type);
      console.log('Moderator:', JSON.stringify(moderator,null,2));
      console.log('Action Object:', JSON.stringify(actionObj,null,2));
      console.log('Display Text:', displayText);
      console.log('Display URL:', displayUrl);
      console.log('\n');
    }
  });

  next();
};

exports.register.attributes = {
  name: 'moderation-log',
  version: '1.0.0'
};
