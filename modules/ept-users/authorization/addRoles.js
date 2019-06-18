var Boom = require('boom');
var Promise = require('bluebird');
var _ = require('lodash');

module.exports = function(server, auth, roleId, usernames) {
  // has permission
  var hasPermission = server.authorization.build({
    error: Boom.forbidden(),
    type: 'hasPermission',
    server: server,
    auth: auth,
    permission: 'users.addRoles.allow'
  });

  var addRole = canAddRole(server, auth, roleId, usernames);

  return Promise.all([hasPermission, addRole]);
};

function canAddRole(server, auth, roleId, usernames) {
  var currentUserId = auth.credentials.id;

  // has access to role
  var authedPriority, refRole;
  var accessRole = server.db.users.find(currentUserId)
  // get current user's priority
  .then(function(curUser) { authedPriority = _.min(_.map(curUser.roles, 'priority')); })
  // get all roles
  .then(server.db.roles.all)
  // get role were trying to add users to
  .then(function(roles) { refRole = _.find(roles, _.matchesProperty('id', roleId)); })
  // make sure authed user is adding to a role with their priority or lower
  // this prevents admins from adding themselves/others as super admins
  .then(function() {
    var errMessage = 'You don\'t have permission to add users to the ' + refRole.name + ' role.';
    if (refRole.priority < authedPriority) { return Promise.reject(Boom.forbidden(errMessage)); }
    else { return true; }
  });

  // can add to role
  var addToRole;
  var samePriority = server.plugins.acls.getACLValue(auth, 'users.addRoles.bypass.priority.same');
  var lowerPriority = server.plugins.acls.getACLValue(auth, 'users.addRoles.bypass.priority.less');

  if (!samePriority && !lowerPriority) { addToRole = Promise.reject(Boom.forbidden()); }
  else {
    // get current user's priority
    var currentPriority = server.db.users.find(currentUserId)
    .then(function(curUser) { return _.min(_.map(curUser.roles, 'priority')); });

    // compare the priority of all usernames
    addToRole = Promise.each(usernames, function(username) {
      // short circuit: users can modify themselves
      if (username === auth.credentials.username) { return true; }

      // get each username's priority
      var refPriority = server.db.users.userByUsername(username)
      .then(function(refUser) { return _.min(_.map(refUser.roles, 'priority')); });

      // compare priorities
      return Promise.join(refPriority, currentPriority, function(referenced, current) {
        var err = Boom.forbidden('You don\'t have permission to add roles to ' + username);
        // current has same or higher priority than referenced
        if (samePriority && current <= referenced) { return true; }
        // current has higher priority than referenced
        else if (lowerPriority && current < referenced) { return true; }
        else { return Promise.reject(err); }
      });
    });
  }

  return Promise.all([accessRole, addToRole]);
}
