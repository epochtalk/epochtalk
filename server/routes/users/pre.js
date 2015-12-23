var _ = require('lodash');
var path = require('path');
var Boom = require('boom');
var bcrypt = require('bcrypt');
var Promise = require('bluebird');
var querystring = require('querystring');
var db = require(path.normalize(__dirname + '/../../../db'));

module.exports = {
  deactivateAuthorized: function(request, reply) {
    var referencedUserId = _.get(request, request.route.settings.app.user_id);
    var currentUserId = request.auth.credentials.id;

    if (referencedUserId === currentUserId) { return reply(currentUserId); }

    // get user's permissions
    var getACLValue = request.server.plugins.acls.getACLValue;
    var samePriority = getACLValue(request.auth, 'users.privilegedDeactivate.samePriority');
    var lowerPriority = getACLValue(request.auth, 'users.privilegedDeactivate.lowerPriority');

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
  },
  reactivateAuthorized: function(request, reply) {
    var referencedUserId = _.get(request, request.route.settings.app.user_id);
    var currentUserId = request.auth.credentials.id;

    if (referencedUserId === currentUserId) { return reply(currentUserId); }

    // get user's permissions
    var getACLValue = request.server.plugins.acls.getACLValue;
    var samePriority = getACLValue(request.auth, 'users.privilegedReactivate.samePriority');
    var lowerPriority = getACLValue(request.auth, 'users.privilegedReactivate.lowerPriority');

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
  },
  isOldPasswordValid: function(request, reply) {
    var oldPassword = request.payload.old_password;
    var userId = request.auth.credentials.id;

    // bypass check if no old password given
    if (!oldPassword) { return reply(true); }

    // check if oldPassword matches what's in the db
    var promise = db.users.find(userId)
    .then(function(user) {
      var valid = Boom.badRequest();
      if (bcrypt.compareSync(oldPassword, user.passhash)) { valid = true; }
      return valid;
    });
    return reply(promise);
  },
  isNewUsernameUnique: function(request, reply) {
    var userId = request.auth.credentials.id;
    var username = request.payload.username ? querystring.unescape(request.payload.username) : undefined;

    // bypass check if no email given
    if (!username) { return reply(true); }

    // check if user exists with this email
    var promise = db.users.userByUsername(username)
    .then(function(user) {
      var unique = Boom.badRequest();
      // username hasn't changed
      if (user && user.id === userId) { unique = true; }
      // user with this username already exists and is not this user
      else if (user) { unique = Boom.badRequest(); }
      // no user with this username
      else { unique = true; }

      return unique;
    });
    return reply(promise);
  },
  isNewEmailUnique: function(request, reply) {
    var userId = request.auth.credentials.id;
    var email = request.payload.email;

    // bypass check if no email given
    if (!email) { return reply(true); }

    // check if user exists with this email
    var promise = db.users.userByEmail(email)
    .then(function(user) {
      var unique = Boom.badRequest();
      // email hasn't changed
      if (user && user.id === userId) { unique = true; }
      // user with this email already exists and is not this user
      else if (user) { unique = Boom.badRequest(); }
      // no user with this email
      else { unique = true; }

      return unique;
    });
    return reply(promise);
  },
  isRequesterActive: function(request, reply) {
    var promise = Boom.unauthorized();
    var authenticated = request.auth.isAuthenticated;
    if (authenticated) {
      var userId = request.auth.credentials.id;
      promise = db.users.find(userId)
      .then(function(user) {
        var active = Boom.forbidden('User Account Not Active');
        if (user && !user.deleted) { active = true; }
        return active;
      });
    }
    return reply(promise);
  },
  isReferencedUserActive: function(request, reply) {
    var userId = _.get(request, request.route.settings.app.user_id);
    var promise = db.users.find(userId)
    .then(function(user) {
      var result = true;
      if (user.deleted) { result = Boom.badRequest('Account is Not Active'); }
      return result;
    })
    .error(function() { return Boom.notFound(); });
    return reply(promise);
  },
  isReferencedUserDeactive: function(request, reply) {
    var userId = _.get(request, request.route.settings.app.user_id);
    var promise = db.users.find(userId)
    .then(function(user) {
      var result = Boom.badRequest('Account is Active');
      if (user.deleted) { result = true; }
      return result;
    })
    .error(function() { return Boom.notFound(); });
    return reply(promise);
  },
  accessUser: function(request, reply) {
    var username = '';
    var payloadUsername = querystring.unescape(request.params.username);
    var authenticated = request.auth.isAuthenticated;
    if (authenticated) { username = request.auth.credentials.username; }

    if (username === payloadUsername) { return reply(true); }

    var getACLValue = request.server.plugins.acls.getACLValue;
    var priviledgedView = getACLValue(request.auth, 'users.viewDeleted');

    var isActive = db.users.userByUsername(payloadUsername)
    .then(function(user) {
      var active = false;
      if (user) { active = !user.deleted; }
      return active;
    });

    // Authed users with privilegedView can see deleted user's posts
    var promise = Promise.join(priviledgedView, isActive, function(privileged, active) {
      var result = Boom.notFound();
      if (priviledgedView || active) { result = true; }
      return result;
    });

    return reply(promise);
  },
};
