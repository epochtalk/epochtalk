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
  var authedUserId;
  var sendableMeritPromise;
  if (request.auth.isAuthenticated) {
    authedUserId = request.auth.credentials.id;
    sendableMeritPromise = request.db.merit.calculateSendableMerit(authedUserId)
    .then(function(data) {
      request.pre.processed.metadata = request.pre.processed.metadata || {};
      request.pre.processed.metadata.merit = data;
      return;
    });
  }

  var postMeritPromise = Promise.map(request.pre.processed.posts, function(post) {
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

  return Promise.join(postMeritPromise, sendableMeritPromise);
}

module.exports = [
  { path: 'users.find.post', method: userMerit },
  { path: 'posts.byThread.post', method: userMeritByPost }
];
