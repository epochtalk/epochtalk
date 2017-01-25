var path = require('path');
var dbc = require(path.normalize(__dirname + '/../../db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(noteId) {
  noteId = helper.deslugify(noteId);
  var q = 'SELECT n.id, n.report_id, n.user_id, n.note, n.created_at, n.updated_at, (SELECT u.username FROM users u WHERE u.id = n.user_id), (SELECT p.avatar FROM users.profiles p WHERE p.user_id = n.user_id) FROM administration.reports_users_notes n WHERE n.id = $1';
  var params = [noteId];
  return db.scalar(q, params)
  .then(helper.slugify);
};
