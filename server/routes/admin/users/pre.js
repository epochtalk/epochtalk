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
    var privilege = request.route.settings.app.privilege;
    var currentUserId = request.auth.credentials.id;

    if (referencedUserId === currentUserId) { return reply(); }

    // get user's permissions
    var getACLValue = request.server.plugins.acls.getACLValue;
    var samePriority = getACLValue(request.auth, privilege + '.samePriority');
    var lowerPriority = getACLValue(request.auth, privilege + '.lowerPriority');

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
  hasAccessToRole: function(request, reply) {
    var authedUserId = request.auth.credentials.id;
    var roleId = request.payload.role_id;
    var authedPriority, refRole;
    var promise = db.users.find(authedUserId)
    .then(function(curUser) {  // get authed user priority
      authedPriority = _.min(_.pluck(curUser.roles, 'priority'));
      return db.roles.all();
    })
    .then(function(roles) { // get role were trying to ad users to
      refRole = _.find(roles, _.matchesProperty('id', roleId));
    })
    .then(function() {
      var result = true;
      // make sure authed user is adding to a role with their priority or lower
      // this prevents admins from adding themselves/others as super admins
      if (refRole.priority < authedPriority) {
        result = Boom.forbidden('You don\'t have permission to add users to the ' + refRole.name + ' role.');
      }
      return result;
    });

    reply(promise);
  },
  hasSufficientPriorityToAddRole: function(request, reply) {
    // get user's permissions
    var getACLValue = request.server.plugins.acls.getACLValue;
    var samePriority = getACLValue(request.auth, 'adminUsers.privilegedAddRoles.samePriority');
    var lowerPriority = getACLValue(request.auth, 'adminUsers.privilegedAddRoles.lowerPriority');
    var promise = Boom.forbidden();

    if (samePriority || lowerPriority) {
      var usernames = request.payload.usernames;
      var authedUserId = request.auth.credentials.id;

      // get authed user priority
      var authedPriority = db.users.find(authedUserId)
      .then(function(curUser) { return _.min(_.pluck(curUser.roles, 'priority')); });
      var refUsername;
      promise = Promise.each(usernames, function(username) {
        refUsername = username;
        var refPriority = db.users.userByUsername(username)
        .then(function(refUser) { return _.min(_.pluck(refUser.roles, 'priority')); });

        // users can modify themselves
        if (refUsername === request.auth.credentials.username) { return true; }
        return Promise.join(refPriority, authedPriority, samePriority, lowerPriority, function(referenced, current, same, lower) {
          var result = false;
          // lower and same are both false, forbidden
          if (!same && !lower) { return result; }
          // current has same or higher priority than referenced
          else if (same && current <= referenced) { result = true; }
          // current has higher priority than referenced
          else if (lower && current < referenced) { result = true; }
          if (result) { return result; }
          else { throw Error('Invalid permissions'); }
        });
      })
      .catch(function() { return Boom.forbidden('You don\'t have permission to add roles to ' + refUsername); });
    }

    return reply(promise);
  },
  hasSufficientPriorityToRemoveRole: function(request, reply) {
    // get user's permissions
    var getACLValue = request.server.plugins.acls.getACLValue;
    var samePriority = getACLValue(request.auth, 'adminUsers.privilegedRemoveRoles.samePriority');
    var lowerPriority = getACLValue(request.auth, 'adminUsers.privilegedRemoveRoles.lowerPriority');
    var promise = Boom.forbidden();

    var refUserId = request.payload.user_id;
    var authedUserId = request.auth.credentials.id;

    if (refUserId === authedUserId) { promise = true; }
    else if (samePriority || lowerPriority) {
      var refUsername;

      // get authed user priority
      var authedPriority = db.users.find(authedUserId)
      .then(function(curUser) { return _.min(_.pluck(curUser.roles, 'priority')); });

      var refPriority = db.users.find(refUserId)
      .then(function(refUser) {
        refUsername = refUser.username;
        return _.min(_.pluck(refUser.roles, 'priority'));
      });

      promise = Promise.join(refPriority, authedPriority, samePriority, lowerPriority, function(referenced, current, same, lower) {
        var result = Boom.forbidden('You don\'t have permission to remove the roles from ' + refUsername);
        // lower and same are both false, forbidden
        if (!same && !lower) { return result; }
        // current has same or higher priority than referenced
        else if (same && current <= referenced) { result = true; }
        // current has higher priority than referenced
        else if (lower && current < referenced) { result = true; }

        return result;
      });
    }
    return reply(promise);
  }
};
