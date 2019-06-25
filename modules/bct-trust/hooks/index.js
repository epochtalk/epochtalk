var Promise = require('bluebird');

function userTrust(request) {
  var authedUserId;
  if (request.auth.isAuthenticated) { authedUserId = request.auth.credentials.id; }

  return Promise.map(request.pre.processed.posts, function(post) {
    return request.db.userTrust.getTrustStats(post.user.id, authedUserId)
    .then(function(stats) {
      post.user.stats = stats;
      return post;
    });
  });
}

function showTrust(request) {
  return request.db.userTrust.getTrustBoards()
  .then(function(boards) {
    var boardId = request.pre.processed.thread.board_id;
    request.pre.processed.thread.trust_visible = boards.indexOf(boardId) > -1;
    return request.pre.processed;
  });
}

module.exports = [
  { path: 'posts.byThread.post', method: userTrust },
  { path: 'posts.byThread.post', method: showTrust }
];
