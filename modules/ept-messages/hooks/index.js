var Promise = require('bluebird');
var Boom = require('boom');

function checkUserIgnoredMessages(request) {
  var receivers = request.payload.receiver_ids;
  var authedUserId;
  if (request.auth.isAuthenticated) { authedUserId = request.auth.credentials.id; }
  else { return Boom.unauthorized('You must log in to perform this action'); }
  var ignoredUsernames = [];
  return Promise.each(receivers, function(receiverId) {
    return request.db.messages.getUserIgnored(authedUserId, receiverId)
    .then(function(data) {
      if (data.ignored) {
        ignoredUsernames.push(data.ignored_username)
      }
      return true;
    });
  })
  .then(function() {
    if (ignoredUsernames.length) {
      return Promise.reject(Boom.forbidden('The following users have blocked you from sending private messages: ' + ignoredUsernames.join(', ')));
    }
    else { return true; }
  });
}

module.exports = [
  { path: 'conversations.create.pre', method: checkUserIgnoredMessages },
  { path: 'messages.create.pre', method: checkUserIgnoredMessages }
];
