var Promise = require('bluebird');
var Boom = require('boom');

function checkUserIgnoredMessages(request) {
  var receivers = request.payload.receiver_ids;
  var authedUserId;
  if (request.auth.isAuthenticated) { authedUserId = request.auth.credentials.id; }
  else { return Boom.unauthorized('You must log in to perform this action'); }
  var ignoredByAuthed = [];
  var ignoringAuthed = [];
  return Promise.each(receivers, function(receiverId) {
    return request.db.messages.getUserIgnored(authedUserId, receiverId)
    .then(function(data) {
        if (data.ignored && data.ignored_by_authed) {
          ignoredByAuthed.push(data.receiver_username);
        }
        else if (data.ignored) {
          ignoringAuthed.push(data.receiver_username);
        }
      return true;
    });
  })
  .then(function() {
    // User is blocking and being blocked
    if (ignoredByAuthed.length && ignoringAuthed.length) {
      return Promise.reject(Boom.forbidden('The following users have blocked you from sending private messages: ' + ignoringAuthed.join(', ') + '. You must also unblock the following users in order to send this message: ' + ignoredByAuthed.join(', ')));
    }
    // User is just blocking receipients
    else if (ignoredByAuthed.length && !ignoringAuthed.length) {
      return Promise.reject(Boom.forbidden('You must unblock the following users in order to send this message: ' + ignoredByAuthed.join(', ')));
    }
    // User is being blocked by receipients
    else if (!ignoredByAuthed.length && ignoringAuthed.length) {
      return Promise.reject(Boom.forbidden('The following users have blocked you from sending private messages: ' + ignoringAuthed.join(', ')));
    }
    else { return true; }
  });
}

function userIgnoredMessages(request) {
  var user = request.pre.processed;
  var authedUserId;
  if (request.auth.isAuthenticated) { authedUserId = request.auth.credentials.id; }
  else { return user; }
  return request.db.messages.getUserIgnored(authedUserId, user.id)
  .then(function(messages) {
    if (messages && messages.ignored) {
      user.ignore_messages = true;
    }
    return user;
  });
}

module.exports = [
  { path: 'users.find.post', method: userIgnoredMessages },
  { path: 'conversations.create.pre', method: checkUserIgnoredMessages },
  { path: 'messages.create.pre', method: checkUserIgnoredMessages }
];
