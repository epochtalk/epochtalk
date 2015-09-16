var path = require('path');
var Boom = require('boom');
var Promise = require('bluebird');
var db = require(path.normalize(__dirname + '/../../../db'));
var sanitizer = require(path.normalize(__dirname + '/../../sanitizer'));

module.exports = {
  // TODO: Implement private boards. Fetch allowed roles/users from board model
  canFind: function(request, reply) {
    var username = '';
    var boardId = request.params.id;
    var authenticated = request.auth.isAuthenticated;
    if (authenticated) { username = request.auth.credentials.username; }

    // TODO: pull permissions, use boards.viewUncategorized in the future
    var isVisible = db.boards.getBoardInBoardMapping(boardId);

    var promise = Promise.join(isVisible, function(visible) {
      var result = Boom.notFound();
      if (visible) { result = ''; }
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
