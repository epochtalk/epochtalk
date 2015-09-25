var _ = require('lodash');
var path = require('path');
var Boom = require('boom');
var Promise = require('bluebird');
var db = require(path.normalize(__dirname + '/../../../db'));
var sanitizer = require(path.normalize(__dirname + '/../../sanitizer'));

module.exports = {
  accessPrivateBoardWithBoardId: function(request, reply) {
    // TODO: Implement private board check
    return reply(true);
  },
  accessBoardWithBoardId: function(request, reply) {
    var userId = '';
    var authenticated = request.auth.isAuthenticated;
    if (authenticated) { userId = request.auth.credentials.id; }
    var boardId = _.get(request, request.route.settings.app.board_id);

    var getACLValue = request.server.plugins.acls.getACLValue;
    var viewSome = getACLValue(request.auth, 'boards.viewUncategorized.some');
    var viewAll = getACLValue(request.auth, 'boards.viewUncategorized.all');
    var boardVisible = db.boards.getBoardInBoardMapping(boardId)
    .then(function(board) { return !!board; });
    var isModerator = db.moderators.isModerator(userId, boardId);

    var promise = Promise.join(boardVisible, viewSome, viewAll, isModerator, function(visible, some, all, isMod) {
      var result = Boom.notFound();
      // Board is visible or user has elevated privelages
      if (visible || all) { result = true; }
      // User is authenticated and can moderate certain boards
      else if (authenticated && some && isMod) { result = true; }
      return result;
    });
    return reply(promise);
  },
  clean: function(request, reply) {
    request.payload.name = sanitizer.strip(request.payload.name);
    if (request.payload.description) {
      request.payload.description = sanitizer.display(request.payload.description);
    }
    return reply();
  }
};
