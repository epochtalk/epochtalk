var Boom = require('boom');
var Promise = require('bluebird');

var helper = {
  adminAccess: function adminAccess(server, auth, permission) {
    return new Promise(function(resolve, reject) {
      var all = server.plugins.acls.getACLValue(auth, permission);
      if (all) { resolve(all); }
      else { reject('not admin'); }
    });
  }
};

function watchBoard(server, auth, boardId) {
  var adminAccess = server.helper.adminAccess(server, auth, 'boards.viewUncategorized.all');

  var visibleBoard = () => {
    var priority = server.plugins.acls.getUserPriority(auth);
    return server.db.threads.getBoardInBoardMapping(boardId, priority)
    .then(function(value) {
      if (value) { return; }
      else { return Promise.reject(); }
    });
  };

  var boardMod = () => {
    var userId = auth.credentials.id;
    var some = server.plugins.acls.getACLValue(auth, 'boards.viewUncategorized.some');
    return server.db.moderators.isModerator(userId, boardId)
    .then(function(mod) {
      if (mod && some) { return; }
      else { return Promise.reject(); }
    });
  };

  return Promise.any([adminAccess, visibleBoard, boardMod])
  .catch(() => { return Boom.notFound('Error Code: ABWBI'); });
}

function watchThread(server, auth, threadId) {
  var adminAccess = server.helper.adminAccess(server, auth, 'boards.viewUncategorized.all');

  var visibleBoard = () => {
    var priority = server.plugins.acls.getUserPriority(auth);
    return server.db.threads.getThreadsBoardInBoardMapping(threadId, priority)
    .then(function(value) {
      if (value) { return; }
      else { return Promise.reject(); }
    });
  };

  var boardMod = () => {
    var userId = auth.credentials.id;
    var some = server.plugins.acls.getACLValue(auth, 'boards.viewUncategorized.some');
    return server.db.moderators.isModeratorWithThreadId(userId, threadId)
    .then(function(mod) {
      if (mod && some) { return; }
      else { return Promise.reject(); }
    });
  };

  return Promise.any([adminAccess, visibleBoard, boardMod])
  .catch(() => { return Boom.notFound('Error Code: ABWTI'); });
}

exports.register = function(server, options, next) {
  options = options || {};

  // append any new methods to authMethods from options

  // append the helper Object
  server.decorate('server', 'helper', helper);

  // expose each method as a server method
  server.method('auth.watchThread', watchThread, { callback: false });
  server.method('auth.watchBoard', watchBoard, { callback: false });

  next();
};

exports.register.attributes = {
  name: 'authorization',
  version: '1.0.0'
};
