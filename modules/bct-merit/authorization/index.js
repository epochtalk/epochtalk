var path = require('path');
var config = require(path.normalize(__dirname + '/../config'));

module.exports = [
  {
    name: 'auth.merit.canMerit',
    method: canMerit,
    options: { callback: false }
  }
];

function canMerit(server, auth, toUserId, postId, amount) {
  var userId;
  var authenticated = auth.isAuthenticated;
  if (authenticated) { userId = auth.credentials.id; }
  console.log('HERE');
  // check base permission
  var allowed = server.authorization.build({
    error: Boom.forbidden('You do not have permissions to send merit'),
    type: 'hasPermission',
    server: server,
    auth: auth,
    permission: 'merit.send.allow'
  }).catch(console.log);

  console.log('TEST');

console.log(allowed);
  // user has permission to see the post they giving merit to
  var read = server.authorization.build({
    error: Boom.unauthorized('You do not have permissions to merit this post'),
    type: 'dbValue',
    method: server.db.posts.getPostsBoardInBoardMapping,
    args: [postId, server.plugins.acls.getUserPriority(auth)]
  });


  // check that user is not exceeding the max merit allowed to user
  var withinUserMax = server.authorization.build({
    error: Boom.badRequest('You may only send up to ' + config.maxToUser + ' merit to a particular user per month.'),
    type: 'dbValue',
    method: server.db.merit.withinUserMax,
    args: [userId, toUserId, amount]
  });

  // check that user is not exceeding the max merit allowed to a post
  var withinUserMax = server.authorization.build({
    error: Boom.badRequest('You may only send up to ' + config.maxToPost + ' merit to a particular post.'),
    type: 'dbValue',
    method: server.db.merit.withinPostMax,
    args: [userId, postId, amount]
  });

  // check that the user isn't giving merit to themselves
  var notAuthedUser = function() {
    if (userId === toUserId) {
      var error = Boom.badRequest('You are not allowed to merit your own posts');
      return Promise.reject(error);
    }
    else { return true; }
  };

  // check that the user isn't giving merit to themselves
  var validMeritAmount = function() {
    if (!amount || amount <= 0) {
      var error = Boom.badRequest('Invalid merit amount');
      return Promise.reject(error);
    }
    else { return true; }
  };

  return Promise.all([allowed, read, withinUserMax, withinPostMax, notAuthedUser, validMeritAmount]);
};
