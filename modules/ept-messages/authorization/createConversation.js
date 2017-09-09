var _ = require('lodash');
var Boom = require('boom');
var Promise = require('bluebird');

module.exports = function conversationsCreate(server, auth, receiverIds) {
  // allowed
  var allowed = server.authorization.build({
    error: Boom.forbidden(),
    type: 'hasPermission',
    server: server,
    auth: auth,
    permission: 'conversations.create.allow'
  });

  // priority restriction
  var priority;
  var em = 'Action Restricted. Please contact an administrator.';
  var admissions = server.plugins.acls.getPriorityRestrictions(auth);
  if (!admissions || admissions.length <= 0) { priority = Promise.resolve(true); }
  else {
    priority = Promise.all(Promise.map(receiverIds, function(receiverId) {
      return server.db.users.find(receiverId)
      .then(function(refUser) {
        var refPriority = _.min(_.map(refUser.roles, 'priority'));
        if (admissions.indexOf(refPriority) >= 0) { return true; }
        else { return Promise.reject(Boom.forbidden(em)); }
      });
    }));
  }

  return Promise.all([allowed, priority]);
};
