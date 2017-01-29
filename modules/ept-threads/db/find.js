var path = require('path');
var Promise = require('bluebird');
var dbc = require(path.normalize(__dirname + '/db'));
var common = require(path.normalize(__dirname + '/../common'));
var db = dbc.db;
var helper = dbc.helper;
var NotFoundError = Promise.OperationalError;

module.exports = function(id) {
  id = helper.deslugify(id);
  var columns = 't.id, t.board_id, t.locked, t.sticky, t.moderated, t.created_at, t.updated_at, t.post_count, p.user_id, p.title, p.username, p.user_deleted';
  var q1 = 'SELECT id, board_id, locked, sticky, moderated, post_count, created_at, updated_at FROM threads WHERE id = $1';
  var q2 = 'SELECT p1.user_id, p1.title, u.username, u.deleted as user_deleted FROM posts p1 LEFT JOIN users u on p1.user_id = u.id WHERE p1.thread_id = t.id ORDER BY p1.created_at limit 1';
  var query = 'SELECT ' + columns + ' FROM ( ' + q1 + ') t LEFT JOIN LATERAL ( ' + q2 + ' ) p ON true';

  var params = [id];
  var formatted_thread = null;
  return db.sqlQuery(query, params)
  .then(function(rows) {
    if (rows.length > 0) { return rows[0]; }
    else { throw new NotFoundError('Thread Not Found'); }
  })
  .then(common.formatThread)
  .then(function(thread){
      formatted_thread = thread;
      return db.sqlQuery('SELECT u.username FROM thread_owners_mapping tom LEFT JOIN users u ON tom.user_id=u.id WHERE thread_id = $1;', params)
  })
  .then(function (rows) {
      if (rows.length > 0) {
          formatted_thread.coOwners = rows.map(function(item){
              return item.username;
          });
      }

      return formatted_thread;
  })
  .then(helper.slugify);
};
