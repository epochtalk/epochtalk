var path = require('path');
var Boom = require('boom');
var Promise = require('bluebird');
var db = require(path.normalize(__dirname + '/../../../db'));
var commonPre = require(path.normalize(__dirname + '/../common')).auth;
var sanitizer = require(path.normalize(__dirname + '/../../sanitizer'));

module.exports = {
  canFind: function(request, reply) {
    var username = '';
    var boardId = request.params.id;
    var authenticated = request.auth.isAuthenticated;
    if (authenticated) { username = request.auth.credentials.username; }

    var isAdmin = commonPre.isAdmin(authenticated, username);
    var isVisible = db.boards.getBoardInBoardMapping(boardId);

    var promise = Promise.join(isAdmin, isVisible, function(admin, visible) {
      var result = Boom.notFound();
      if (admin) { result = ''; }
      else if (visible) { result = ''; }
      return result;
    });
    return reply(promise);
  },
  canAll: isAdmin,
  canCreate: isAdmin,
  canUpdate: isAdmin,
  canDelete: isAdmin,
  clean: function(request, reply) {
    request.payload.name = sanitizer.strip(request.payload.name);
    if (request.payload.description) {
      request.payload.description = sanitizer.display(request.payload.description);
    }
    return reply();
  }
};

function isAdmin(request, reply) {
  var username = '';
  var authenticated = request.auth.isAuthenticated;
  if (authenticated) { username = request.auth.credentials.username; }
  var promise = commonPre.isAdmin(authenticated, username)
  .then(function(admin) {
    var result = Boom.forbidden();
    if (admin) { result = ''; }
    return result;
  });
  return reply(promise);
}
