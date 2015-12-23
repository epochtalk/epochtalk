var _ = require('lodash');
var Boom = require('boom');
var path = require('path');
var Promise = require('bluebird');
var db = require(path.normalize(__dirname + '/../../../db'));

module.exports = {
  accessBoardWithThreadId: function(request, reply) {
    var userId = '';
    var authenticated = request.auth.isAuthenticated;
    if (authenticated) { userId = request.auth.credentials.id; }
    var threadId = _.get(request, request.route.settings.app.thread_id);

    var getUserPriority = request.server.plugins.acls.getUserPriority;
    var priority = getUserPriority(request.auth);
    var getACLValue = request.server.plugins.acls.getACLValue;
    var viewAll = getACLValue(request.auth, 'boards.viewUncategorized.all');
    var viewSome = getACLValue(request.auth, 'boards.viewUncategorized.some');
    var isMod = db.moderators.isModeratorWithThreadId(userId, threadId);
    var boardVisible = db.threads.getThreadsBoardInBoardMapping(threadId, priority);

    var promise = Promise.join(boardVisible, viewAll, viewSome, isMod, function(visible, all, some, mod) {
      var result = Boom.notFound();
      // Board is visible or user has elevated privelages
      if (visible || all) { result = true; }
      // User is authenticated and can moderate certain boards
      else if (some && mod) { result = true; }
      return result;
    });
    return reply(promise);
  },
  accessBoardWithBoardId: function(request, reply) {
    var userId = '';
    var authenticated = request.auth.isAuthenticated;
    if (authenticated) { userId = request.auth.credentials.id; }
    var boardId = _.get(request, request.route.settings.app.board_id);

    var getUserPriority = request.server.plugins.acls.getUserPriority;
    var priority = getUserPriority(request.auth);
    var getACLValue = request.server.plugins.acls.getACLValue;
    var viewAll = getACLValue(request.auth, 'boards.viewUncategorized.all');
    var viewSome = getACLValue(request.auth, 'boards.viewUncategorized.some');
    var isMod = db.moderators.isModeratorWithThreadId(userId, boardId);
    var boardVisible = db.boards.getBoardInBoardMapping(boardId, priority);

    var promise = Promise.join(boardVisible, viewAll, viewSome, isMod, function(visible, all, some, mod) {
      var result = Boom.notFound();
      // Board is visible or user has elevated privelages
      if (visible || all) { result = true; }
      // User is authenticated and can moderate certain boards
      else if (some && mod) { result = true; }
      return result;
    });
    return reply(promise);
  }
};
