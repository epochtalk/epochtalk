var Boom = require('boom');
var Promise = require('bluebird');
var _ = require('lodash');

module.exports = function(server, auth, userId, boardIds) {
  var hasPermission = server.authorization.build({
    error: Boom.forbidden(),
    type: 'hasPermission',
    server: server,
    auth: auth,
    permission: 'bans.banFromBoards'
  });

  var hasPriority = hasBoardBanPriority(server, auth, userId);
  return Promise.all([hasPermission, hasPriority])
};

function hasBoardBanPriority(server, auth, userId, boardIds) {
  // match priority
  var currentUserId = auth.credentials.id;
  var same = server.plugins.acls.getACLValue(auth, 'bans.banFromBoards.bypass.priority.same');
  var lower = server.plugins.acls.getACLValue(auth, 'bans.banFromBoards.bypass.priority.less');

  // Check if the user has global mod permissions
  var some = server.plugins.acls.getACLValue(auth, 'bans.banFromBoards.bypass.type.mod');
  var all = server.plugins.acls.getACLValue(auth, 'bans.banFromBoards.bypass.type.admin');

  // get referenced user's priority
  var refPriority = server.db.users.find(userId)
  .then(function(refUser) { return _.min(_.map(refUser.roles, 'priority')); });

  // get authed user priority
  var curPriority = server.db.users.find(currentUserId)
  .then(function(curUser) { return _.min(_.map(curUser.roles, 'priority')); });


  // compare priorities
  var match = Promise.join(refPriority, curPriority, function(referenced, current) {
    if (userId === currentUserId) { return; }
    // User is a normal mod and try to ban from a board they do not moderate
    if ((!all && some && _.difference(boardIds, auth.credentials.moderating).length) || !all && !some) {
      return Promise.reject(Boom.forbidden('You can only modify user\'s bans for boards you moderate'));
    }

    // current has same or higher priority than referenced
    if (same && current <= referenced) { return userId; }
    // current has higher priority than referenced
    else if (lower && current < referenced) { return userId; }
    else { return Promise.reject(Boom.forbidden()); }
  });

  return match;
}
