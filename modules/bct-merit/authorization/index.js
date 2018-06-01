var path = require('path');
var Boom = require('boom');
var Promise = require('bluebird');
var Boom = require('boom');
var config = require(path.normalize(__dirname + '/../config'));

var send = {
  name: 'auth.merit.send',
  method: function(server, auth, toUserId, postId, amount) {
    var userId;
    var authenticated = auth.isAuthenticated;
    if (authenticated) { userId = auth.credentials.id; }
    // check base permission
    var allowed = server.authorization.build({
      error: Boom.forbidden('You do not have permissions to send merit'),
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'merit.send.allow'
    });

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
    var withinPostMax = server.authorization.build({
      error: Boom.badRequest('You may only send up to ' + config.maxToPost + ' merit to a particular post.'),
      type: 'dbValue',
      method: server.db.merit.withinPostMax,
      args: [userId, postId, amount]
    });

    // check that the user isn't giving merit to themselves
    var notAuthedUser = new Promise(function(resolve, reject) {
      if (userId === toUserId) {
        var error = Boom.badRequest('You are not allowed to merit your own posts');
        return reject(error);
      }
      else { resolve(true); }
    });

    // check that the user isn't giving merit to themselves
    var validMeritAmount = new Promise(function(resolve, reject) {
      if (!amount || amount <= 0) {
        var error = Boom.badRequest('Invalid merit amount, you must send at least 1 merit.');
        return reject(error);
      }
      else { return resolve(true); }
    });

    return Promise.all([allowed, read, withinUserMax, withinPostMax, notAuthedUser, validMeritAmount]);
  },
  options: { callback: false }
}

var getUserStatistics = {
  name: 'auth.merit.getUserStatistics',
  method: function(server, auth) {
    return server.authorization.build({
      error: Boom.forbidden(),
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'merit.getUserStatistics.allow'
    });
  },
  options: { callback: false }
};

module.exports = [ send, getUserStatistics ];
