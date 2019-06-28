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
    permission: 'users.removeRole.allow'
  });

  var removeRole = canRemoveRole(server, auth, roleId, usernames);

  return Promise.all([hasPermission, removeRole]);
};


function canRemoveRole(server, auth, userId) {
  // can delete role from user
  var currentUserId = auth.credentials.id;
  var samePriority = server.plugins.acls.getACLValue(auth, 'users.removeRole.bypass.priority.same');
  var lowerPriority = server.plugins.acls.getACLValue(auth, 'users.removeRole.bypass.priority.less');

  var promise;
  if (userId === currentUserId) { promise = true; }
  else if (samePriority || lowerPriority) {
    // get current user's priority
    var authedPriority = server.db.users.find(currentUserId)
    .then(function(curUser) { return _.min(_.map(curUser.roles, 'priority')); });

    // get referenced user's priority and username
    var refUsername;
    var refPriority = server.db.users.find(userId)
    .then(function(refUser) {
      refUsername = refUser.username;
      return _.min(_.map(refUser.roles, 'priority'));
    });

    // compare priorities
    promise = Promise.join(refPriority, authedPriority, function(referenced, current) {
      var err = Boom.forbidden('Insufficient permissions to remove role from ' + refUsername);
      // current has same or higher priority than referenced
      if (samePriority && current <= referenced) { return true; }
      // current has higher priority than referenced
      else if (lowerPriority && current < referenced) { return true; }
      else { return Promise.reject(err); }
    });
  }
  else { promise = Promise.reject(Boom.forbidden()); }
  return promise;
}
