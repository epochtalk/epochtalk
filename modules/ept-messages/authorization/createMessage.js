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

  // check if user is ignoring newbies, if they are they cannot send messages to newbies
  var canMessageNewbies = server.db.messages.getMessageSettings(userId)
  .then(function(data) {
    if (data) { return data.ignore_newbies; }
    else { return Promise.reject(Boom.badRequest('There was an error starting your conversation')); }
  })
  .then(function(isIgnoring) {
    if (isIgnoring) {
      return Promise.all(Promise.map(receiverIds, function(receiverId) {
        return server.db.users.find(receiverId)
        .then(function(refUser) {
          var refIsNewbie = false;
          for(var i = 0; i < refUser.roles.length; i++) {
            var roleLookup = refUser.roles[i].lookup;
            if (roleLookup === 'newbie') {
              refIsNewbie = true;
              break;
            }
          }
          if (refIsNewbie) {
            return Promise.reject(Boom.forbidden(refUser.username + ' is a newbie, you must stop ignoring newbie messages in order to send this message'));
          }
          else { return Promise.resolve(true); }
        });
      }));
    }
    else { return Promise.resolve(true); }
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
      .then(function(refUser) {
        var refPriority = _.min(_.map(refUser.roles, 'priority'));
        if (admissions.indexOf(refPriority) >= 0) { return true; }
        else { return Promise.reject(Boom.forbidden(em)); }
      });
    }));
  }

  return Promise.all([allowed, convoMember, priority, canMessageNewbies]);
};

