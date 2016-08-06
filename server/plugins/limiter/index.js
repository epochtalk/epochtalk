var _ = require('lodash');
var path = require('path');
var Boom = require('boom');
var Hoek = require('hoek');
var limiter = require('rolling-rate-limiter');
var roles = require(path.normalize(__dirname + '/../acls/roles'));
var redis;

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

var putDefaults = {
  interval: 1000,
  maxInInterval: 2,
  minDifference: 500
};

var deleteDefaults = {
  interval: 1000,
  maxInInterval: 2,
  minDifference: 500
};

// TODO: Remove this, modify image upload to accept batch uploads
var imageUploadOverrides = {
  interval: 5000,
  maxInInterval: 10
};

exports.register = function(plugin, options, next) {
  if (!options.redis) { return next(new Error('Redis not found in limiter')); }
  redis = options.redis;
  updateLimits(options);
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
        if (userRole) { // fix for when role is removed, but "undefined" remains in redis
          var userLimits = userRole.limits;
          var priorityValid = priority === undefined || userRole.priority > priority;
          if (userLimits && priorityValid) { limits = userLimits; }
        }
      });

      if (limits) {
        routeLimit = _.clone(_.find(limits, function(limit) {
          return limit.path === path && limit.method === method;
        }));
      }
    }

    // TODO: Remove this, modify image upload to accept batch uploads
    if (!routeLimit && path === '/images/upload') {
      routeLimit = _.clone(imageUploadOverrides);
    }

    // default to global settings
    else if (!routeLimit && method === 'GET') { routeLimit = _.clone(getDefaults); }
    else if (!routeLimit && method === 'POST') { routeLimit = _.clone(postDefaults); }
    else if (!routeLimit && method === 'PUT') { routeLimit = _.clone(putDefaults); }
    else if (!routeLimit && method === 'DELETE') { routeLimit = _.clone(deleteDefaults); }
    else if (!routeLimit) { routeLimit = _.clone(postDefaults); }

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

  // for modifing existing default rate limits
  plugin.expose('updateLimits', updateLimits);

  next();
};

function updateLimits(newLimits) {
  getDefaults = Hoek.applyToDefaults(getDefaults, newLimits.get);
  postDefaults = Hoek.applyToDefaults(postDefaults, newLimits.post);
  putDefaults = Hoek.applyToDefaults(putDefaults, newLimits.put);
  deleteDefaults = Hoek.applyToDefaults(deleteDefaults, newLimits.delete);
}

exports.register.attributes = {
  name: 'rate-limiter',
  version: '1.0.0'
};
