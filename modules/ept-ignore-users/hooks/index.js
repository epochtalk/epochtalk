var _ = require('lodash');

function isIgnored(request) {
  var data = request.pre.processed;
  var userId;
  if (request.auth.isAuthenticated) { userId = request.auth.credentials.id; }
  var userIds = _.map(data.posts || data, function(post) { return post.user.id; });
  return request.db.ignoreUsers.isIgnored(userId, userIds)
  .then(function(ignoredUsers) {
    _.map(ignoredUsers, function(ignoredUser) {
      _.map(data.posts || data, function(post) {
        if (post.user.id === ignoredUser.ignored_user_id) {
          post.user.ignored = true;
          post.user._ignored = true;
        }
      });
    });
  });
}

function userIgnored(request) {
  var user = request.pre.processed;
  var authedUserId;
  if (request.auth.isAuthenticated) { authedUserId = request.auth.credentials.id; }
  else { return user; }
  return request.db.ignoreUsers.isIgnored(authedUserId, [ user.id ])
  .then(function(ignoredUsers) {
    if (ignoredUsers && ignoredUsers.length && ignoredUsers[0].ignored_user_id === user.id) {
      user.ignored = true;
      user._ignored = true;
    }
    return user;
  });
}


module.exports = [
  { path: 'users.find.post', method: userIgnored },
  { path: 'posts.patroller.post', method: isIgnored },
  { path: 'posts.byThread.post', method: isIgnored }
];
