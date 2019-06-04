var Promise = require('bluebird');
var Boom = require('boom');

function isOwner(server, auth, noteId) {
  var userId = auth.credentials.id;
  var isOwner = server.db.userNotes.find(noteId)
  .then(function(note) {
    if (note.author_id === userId) { return true; }
    else { return Promise.reject(Boom.forbidden('Only the author can modify this usernote')); }
  });
  return isOwner;
}

module.exports = {
  isOwner: isOwner
};
