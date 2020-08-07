var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;
var errors = dbc.errors;
var NotFoundError = errors.NotFoundError;

module.exports = function(threadId, slug) {
  var q, params;
  if (threadId) {
    threadId = helper.deslugify(threadId);
    var q = 'SELECT p.id, p.content ->> \'title\' as title, p.content ->> \'body\' as body, p.thread_id, u.username FROM posts p LEFT JOIN users u ON u.id = p.user_id WHERE p.thread_id = $1 ORDER BY p.created_at LIMIT 1';
    params = [threadId];
  }
  else {
    var q = 'SELECT p.id, p.content ->> \'title\' as title, p.content ->> \'body\' as body, p.thread_id, u.username FROM posts p LEFT JOIN users u ON u.id = p.user_id WHERE p.slug = $1 ORDER BY p.created_at LIMIT 1';
    params = [slug];
  }
  return db.sqlQuery(q, params)
  .then(function(rows) {
    if (rows.length > 0) { return rows[0]; }
    else { return new NotFoundError('Thread Not Found'); }
  })
  .then(helper.slugify);
};
