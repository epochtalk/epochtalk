var _ = require('lodash');
var Boom = require('boom');
var Promise = require('bluebird');

module.exports = function messagesCreate(server, auth, receiverIds, convoId) {
  var userId = auth.credentials.id;

  // allowed
  var allowed = server.authorization.build({
    error: Boom.forbidden(),
    type: 'hasPermission',
    server: server,
    auth: auth,
    permission: 'messages.create.allow'
  });

  // is a member of the conversation
  var convoMember = server.db.conversations.isConversationMember(convoId, userId)
  .then(function(isMember) {
    if (isMember) { return true; }
    else { return Promise.reject(Boom.forbidden('Not a part of this conversation')); }
  });

  // priority restriction
  var priority;
  var em = 'Action Restricted. Please contact an administrator.';
  var admissions = server.plugins.acls.getPriorityRestrictions(auth);
  if (!admissions || admissions.length <= 0) { priority = Promise.resolve(true); }
  else {
    priority = Promise.all(Promise.map(receiverIds, function(receiverId) {
      return server.db.users.find(receiverId)
      .then(function(refUser) { return _.min(_.map(refUser.roles, 'priority')); })
      // check if the user being messaged has a priority the authed user has access to msg
      .then(function(refPriority) {
        if (admissions.indexOf(refPriority) >= 0) { return true; }
        else { return Promise.reject(Boom.forbidden(em)); }
      });
    }));
  }

  return Promise.all([allowed, convoMember, priority]);
};
