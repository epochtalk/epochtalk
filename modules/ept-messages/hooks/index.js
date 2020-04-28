var Promise = require('bluebird');
var Boom = require('boom');

function checkUserIgnoredMessages(request) {
  var receivers = request.payload.receiver_ids;
  var authedUserId;
  if (request.auth.isAuthenticated) { authedUserId = request.auth.credentials.id; }
  else { return Boom.unauthorized('You must log in to perform this action'); }
  return Promise.each(receivers, function(receiverId) {
    return request.db.messages.getUserIgnored(receiverId, authedUserId)
    .then(function(data) {
      if (data.ignored) { return Promise.reject(Boom.forbidden('One or more of the users you are trying to send a message to has choosen to ignore you.')); }
      else { return true; }
    });
  });
}

module.exports = [
  { path: 'conversations.create.pre', method: checkUserIgnoredMessages },
  { path: 'messages.create.pre', method: checkUserIgnoredMessages }
];
