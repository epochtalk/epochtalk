var Promise = require('bluebird');

function userActivity(request) {
  var user = request.pre.processed;
  return request.db.userActivity.userActivity(user.id)
  .then(function(activity) {
    user.activity = activity;
    return user;
  });
}

function userPostActivity(request) {
  return Promise.map(request.pre.processed.posts, function(post) {
    return request.db.userActivity.userActivity(post.user.id)
    .then(function(activity) {
      post.user.activity = activity;
      return post;
    });
  });
}

function updateUserActivity(request) {
  var userId = request.pre.processed.user_id;
  request.db.userActivity.updateUserActivity(userId)
  .then(function(info) {
    // Check if the users activity just passed 30, if so remove the newbie role
    if (info && info.old_activity < 30 && info.updated_activity >= 30) {
      var newbieRoleId = 'CN0h5ZeBTGqMbzwVdMWahQ';
      return request.db.users.removeRole(userId, newbieRoleId)
      .tap(function(user) {
        var notification = {
          channel: { type: 'user', id: user.id },
          data: { action: 'reauthenticate' }
        };
        request.server.plugins.notifications.systemNotification(notification);
      })
      .then(function(user) {
        return request.session.updateRoles(user.id, user.roles);
      });
    }
  });
  return true;
}

module.exports = [
  { path: 'users.find.post', method: userActivity },
  { path: 'posts.byThread.post', method: userPostActivity },
  { path: 'posts.create.post', method: updateUserActivity }
];
