var Boom = require('boom');
var Promise = require('bluebird');

module.exports = function watchBoard(server, auth, boardId) {
  // Allowed
  var allowed = server.authorization.build({
    error: Boom.forbidden(),
    type: 'hasPermission',
    server: server,
    auth: auth,
    permission: 'watchlist.watchBoard.allow'
  });

  // read board
  var read = server.authorization.build({
    error: Boom.notFound('Board Not Found'),
    type: 'dbValue',
    method: server.db.boards.getBoardInBoardMapping,
    args: [boardId, server.plugins.acls.getUserPriority(auth)]
  });

  return Promise.all([allowed, read]);
};
