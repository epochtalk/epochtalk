var _ = require('lodash');
var Boom = require('boom');
var Promise = require('bluebird');

module.exports = function userDeactivate(server, auth, userId) {
  // check base permission
  var allowed = server.authorization.build({
    error: Boom.forbidden(),
    type: 'hasPermission',
    server: server,
    auth: auth,
    permission: 'users.delete.allow'
  });

  // -- does the requester have the authority to deactivate
  var paramUserId = userId;
  var authedUserId = auth.credentials.id;
  var same = server.plugins.acls.getACLValue(auth, 'users.delete.bypass.priority.admin');
  var lower = server.plugins.acls.getACLValue(auth, 'users.delete.bypass.priority.mod');

  // get referenced user's priority
  var paramPriority = server.db.users.find(paramUserId)
  .then(function(paramUser) { return _.min(_.map(paramUser.roles, 'priority')); })
  .error(() => { return Promise.reject(Boom.badRequest()); });

  // get authed user's priority
  var authedPriority = server.db.users.find(authedUserId)
  .then(function(authUser) { return _.min(_.map(authUser.roles, 'priority')); })
  .error(() => { return Promise.reject(Boom.badRequest()); });

  var priority = Promise.join(paramPriority, authedPriority, function(paramId, authedId) {
    // current has same or higher priority than referenced
    if (same && authedId <= paramId) { return; }
    // current has higher priority than referenced
    else if (lower && authedId < paramId) { return; }
    else { return Promise.reject(Boom.badRequest()); }
  });

  return Promise.all([allowed, priority]);
};
