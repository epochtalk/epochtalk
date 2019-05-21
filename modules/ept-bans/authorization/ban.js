var Boom = require('boom');
var Promise = require('bluebird');
var _ = require('lodash');

module.exports = function(server, auth, userId) {
  var hasPermission = server.authorization.build({
    error: Boom.forbidden(),
    type: 'hasPermission',
    server: server,
    auth: auth,
    permission: 'bans.ban'
  });

  var priority = hasPriority(server, auth, userId);
  return Promise.all([hasPermission, priority])
};

function hasPriority(server, auth, userId) {
  // match priority
  var currentUserId = auth.credentials.id;
  var same = server.plugins.acls.getACLValue(auth, 'bans.ban.bypass.priority.same');
  var lower = server.plugins.acls.getACLValue(auth, 'bans.ban.bypass.priority.less');

  // get referenced user's priority
  var refPriority = server.db.users.find(userId)
  .then(function(refUser) { return _.min(_.map(refUser.roles, 'priority')); });

  // get authed user priority
  var curPriority = server.db.users.find(currentUserId)
  .then(function(curUser) { return _.min(_.map(curUser.roles, 'priority')); });

  // compare priorities
  var match = Promise.join(refPriority, curPriority, function(referenced, current) {
    if (userId === currentUserId) { return; }
    // current has same or higher priority than referenced
    if (same && current <= referenced) { return userId; }
    // current has higher priority than referenced
    else if (lower && current < referenced) { return userId; }
    else { return Promise.reject(Boom.forbidden('This user has higher permissions than you')); }
  });

  return match;
}
