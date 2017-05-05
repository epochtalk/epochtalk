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
      q = 'SELECT * FROM posts WHERE thread_id = $1 ORDER BY created_at LIMIT 1';
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
