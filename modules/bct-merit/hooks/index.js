var Promise = require('bluebird');

function userMerit(request) {
  var user = request.pre.processed;
  return request.db.merit.get(user.id)
  .then(function(data) {
    user.merit = data.merit;
    return user;
  });
}

function userMeritByPost(request) {
  return Promise.map(request.pre.processed.posts, function(post) {
    return request.db.merit.get(post.user.id)
    .then(function(data) {
      post.user.merit = data.merit;
      return request.db.merit.getPostMerits(post.id);
    })
    .then(function(merits) {
      post.merits = merits;
      return post;
    });
  });
}

module.exports = [
  { path: 'users.find.post', method: userMerit },
  { path: 'posts.byThread.post', method: userMeritByPost }
];
