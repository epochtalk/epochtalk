var _ = require('lodash');
var path = require('path');
var Boom = require('boom');
var Hoek = require('hoek');
var limiter = require('rolling-rate-limiter');
var roles = require(path.normalize(__dirname + '/../acls/roles'));
var redis = require(path.normalize(__dirname + '/../../../redis'));

var namespace = 'ept:';

var getDefaults = {
  interval: -1,
  maxInInterval: 10,
  minDifference: 100
};

var postDefaults = {
  interval: 1000,
  maxInInterval: 2,
  minDifference: 500
};

var deleteDefaults = {
  interval: 1000,
  maxInInterval: 2,
  minDifference: 500
};

exports.register = function(plugin, options, next) {
  var getSettings = Hoek.applyToDefaults(getDefaults, options.get);
  var postSettings = Hoek.applyToDefaults(postDefaults, options.post);
  var deleteSettings = Hoek.applyToDefaults(deleteDefaults, options.delete);
  namespace = options.namespace || namespace;

  plugin.ext('onPostAuth', function(request, reply) {
    // variables
    var key = '';
    var routeLimit;
    var userRoles = [];
    var path = request.route.path;
    var method = request.route.method.toUpperCase();
    var authenticated = request.auth.isAuthenticated;

    // ignore static paths
    if (path === '/static/{path*}' || path === '/{path*}') { return reply.continue(); }

    // check if user is authenticated
    if (authenticated) {
      key = request.auth.credentials.id + ':' + path + ':' + method;
      userRoles = request.auth.credentials.roles;
      if (userRoles.length === 0) { userRoles = ['users']; }
    }
    else { key = request.info.remoteAddress + ':' + path + ':' + method; }

    // calculate route limits
    if (userRoles.length > 0) {
      var priority;
      var limits;
      userRoles.forEach(function(role) {
        var userRole = roles[role];
        var userLimits = userRole.limits;
        var priorityValid = priority === undefined || userRole.priority > priority;
        if (userLimits && priorityValid) { limits = userLimits; }
      });

      if (limits) {
        routeLimit = _.clone(_.find(limits, function(limit) {
          return limit.path === path && limit.method === method;
        }));
      }
    }

    // default to global settings
    if (!routeLimit && method === 'GET') { routeLimit = getSettings; }
    else if (!routeLimit && method === 'POST') { routeLimit = postSettings; }
    else if (!routeLimit && method === 'DELETE') { routeLimit = deleteSettings; }
    else if (!routeLimit) { routeLimit = postSettings; }

    // check if limits are valid, bypass if not
    if (routeLimit.interval < 0) { return reply.continue(); }

    // setup rate limiter
    routeLimit.redis = redis;
    routeLimit.namespace = namespace;
    var routeLimiter = limiter(routeLimit);

    // query rate limiter to see if route should be blocked
    routeLimiter(key, function(err, timeLeft) {
      if (err) { return reply(err); }
      else if (timeLeft) {
        return reply(Boom.tooManyRequests('Rate Limit Exceeded'));
      }
      else { return reply.continue(); }
    });
  });

  next();
};

exports.register.attributes = {
  name: 'rate-limiter',
  version: '1.0.0'
};
