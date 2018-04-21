var Promise = require('bluebird');

function getUsersRanks(request) {
  var authedUserId;
  if (request.auth.isAuthenticated) { authedUserId = request.auth.credentials.id; }
  return Promise.map(request.pre.processed.posts, function(post) {
    return request.db.ranks.getUserRank(post.user.id)
    .then(function(data) {
      post.user.rank = data.rank;
      return post;
    });
  });
}

module.exports = [
  { path: 'posts.byThread.post', method: getUsersRanks }
];
