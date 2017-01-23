var Boom = require('boom');
var Promise = require('bluebird');

module.exports = function(server, auth) {
  var config = server.app.config;

  // check if portal enabled
  var enabled = new Promise(function(resolve, reject) {
    if (config.portal.enabled) { return resolve(true); }
    else { return reject(Boom.badRequest('Portal Disabled')); }
  });

  // check base permission
  var allowed = server.authorization.build({
    error: Boom.forbidden(),
    type: 'hasPermission',
    server: server,
    auth: auth,
    permission: 'portal.view.allow'
  });

  // read board
  var boardId = config.portal.boardId;
  var read = server.authorization.build({
    error: Boom.badRequest('Board Not Set or Visibility is too high.'),
    type: 'dbValue',
    method: server.db.boards.getBoardInBoardMapping,
    args: [boardId, server.plugins.acls.getUserPriority(auth)]
  });

  var priority = server.plugins.acls.getUserPriority(auth);

  return Promise.all([enabled, allowed, read, priority])
  .then(function(dataArr) { return dataArr[3]; });
};
