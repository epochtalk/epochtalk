var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;
var errors = dbc.errors;
var NotFoundError = errors.NotFoundError;

module.exports = function(postId) {
  postId = helper.deslugify(postId);
  var q = 'SELECT thread_id FROM posts WHERE id = $1';
  return db.sqlQuery(q, [postId])
  .then(function(rows) {
    if (rows.length > 0) {
      q = `SELECT p.*, u.username, u.deleted as user_deleted, up.signature, up.post_count, up.avatar, up.fields->\'name\' as name, (SELECT priority FROM roles WHERE lookup =\'user\') AS default_priority FROM posts WHERE p.thread_id = $1
           LEFT JOIN users u ON p.user_id = u.id
           LEFT JOIN users.profiles up ON u.id = up.user_id
           ORDER BY p.created_at LIMIT 1`;
      return db.sqlQuery(q, [rows[0].thread_id]);
    }
    else { throw new NotFoundError('Post Not Found'); }
  })
  .then(function(rows) {
    if (rows.length > 0 ) { return rows[0]; }
    else { throw new NotFoundError('First Post Not Found'); }
  })
  .then(helper.slugify);
};
