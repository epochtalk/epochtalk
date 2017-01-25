var Boom = require('boom');
var Promise = require('bluebird');

module.exports = function(server, auth, noteId) {
  var allowed = server.authorization.build({
    error: Boom.forbidden(),
    type: 'hasPermission',
    server: server,
    auth: auth,
    permission: 'reports.updateMessageReportNote.allow'
  });

  var userId = auth.credentials.id;
  var update = server.db.reports.findMessageReportNote(noteId)
  .then(function(note) {
    if (note.user_id === userId) { return true; }
    else { return Promise.reject(Boom.forbidden('Only the author can update this note')); }
  });

  return Promise.all([allowed, update]);
};
