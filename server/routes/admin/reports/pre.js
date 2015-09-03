var path = require('path');
var Boom = require('boom');
var db = require(path.normalize(__dirname + '/../../../../db'));

module.exports = {
  canUpdateUserReportNote: function(request, reply) {
    var userId = request.auth.credentials.id;
    var noteId = request.payload.id;
    db.reports.findUserReportNote(noteId)
    .then(function(note) {
      var noteUserId = note.user_id;
      if (noteUserId === userId) { return reply(); }
      else { return reply(Boom.unauthorized('Only the author of this user report note can update it')); }
    })
    .catch(function(err) { return reply(Boom.badRequest(err)); });
  },
  canUpdatePostReportNote: function(request, reply) {
    var userId = request.auth.credentials.id;
    var noteId = request.payload.id;
    db.reports.findPostReportNote(noteId)
    .then(function(note) {
      var noteUserId = note.user_id;
      if (noteUserId === userId) { return reply(); }
      else { return reply(Boom.unauthorized('Only the author of this post report note can update it')); }
    })
    .catch(function(err) { return reply(Boom.badRequest(err)); });
  },
  canUpdateMessageReportNote: function(request, reply) {
    var userId = request.auth.credentials.id;
    var noteId = request.payload.id;
    db.reports.findMessageReportNote(noteId)
    .then(function(note) {
      var noteUserId = note.user_id;
      if (noteUserId === userId) { return reply(); }
      else { return reply(Boom.unauthorized('Only the author of this message report note can update it')); }
    })
    .catch(function(err) { return reply(Boom.badRequest(err)); });
  }
};
