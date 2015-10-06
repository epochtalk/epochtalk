var _ = require('lodash');
var path = require('path');
var Boom = require('boom');
var Promise = require('bluebird');
var db = require(path.normalize(__dirname + '/../../../../db'));
var querystring = require('querystring');

module.exports = {
  isNewUsernameUnique: function(request, reply) {
    var referencedUserId = request.payload.id;
    var username = request.payload.username ? querystring.unescape(request.payload.username) : undefined;

    // bypass check if no email given
    if (!username) { return reply(true); }

    // check if user exists with this email
    var promise = db.users.userByUsername(username)
    .then(function(user) {
      var unique = Boom.badRequest();
      // username hasn't changed
      if (user && user.id === referencedUserId) { unique = true; }
      // user with this username already exists and is not this user
      else if (user) { unique = Boom.badRequest(); }
      // no user with this username
      else { unique = true; }
      return unique;
    });
    return reply(promise);
  },
  isNewEmailUnique: function(request, reply) {
    var referencedUserId = request.payload.id;
    var email = request.payload.email;

    // bypass check if no email given
    if (!email) { return reply(true); }

    // check if user exists with this email
    var promise = db.users.userByEmail(email)
    .then(function(user) {
      var unique = Boom.badRequest();
      // email hasn't changed
      if (user && user.id === referencedUserId) { unique = true; }
      // user with this email already exists and is not this user
      else if (user) { unique = Boom.badRequest(); }
      // no user with this email
      else { unique = true; }
      return unique;
    });
    return reply(promise);
  },
  matchPriority: function(request, reply) {
    var referencedUserId = _.get(request, request.route.settings.app.user_id);
    var currentUserId = request.auth.credentials.id;

    if (referencedUserId === currentUserId) { return reply(); }

    // get user's permissions
    var getACLValue = request.server.plugins.acls.getACLValue;
    var samePriority = getACLValue(request.auth, 'adminUsers.privilegedUpdate.samePriority');
    var lowerPriority = getACLValue(request.auth, 'adminUsers.privilegedUpdate.lowerPriority');

    // get referenced user's priority
    var refPriority = db.users.find(referencedUserId)
    .then(function(refUser) { return _.min(_.pluck(refUser.roles, 'priority')); });

    // get authed user priority
    var curPriority = db.users.find(currentUserId)
    .then(function(curUser) { return _.min(_.pluck(curUser.roles, 'priority')); });

    var promise = Promise.join(refPriority, curPriority, samePriority, lowerPriority, function(referenced, current, same, lower) {
      var result = Boom.forbidden();

      // lower and same are both false, forbidden
      if (!same && !lower) { return result; }
      // current has same or higher priority than referenced
      else if (same && current <= referenced) { result = referencedUserId; }
      // current has higher priority than referenced
      else if (lower && current < referenced) { result = referencedUserId; }

      return result;
    });

    return reply(promise);
  }
};
