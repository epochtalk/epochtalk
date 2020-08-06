var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(userId, threadId, slug) {
  userId = helper.deslugify(userId);
  var q = 'SELECT user_id, t.moderated FROM posts p LEFT JOIN threads t ON t.id = $1 WHERE ';
  var params;
  if (slug) {
    q += 'slug = $1 ORDER BY p.created_at LIMIT 1';
    params = [slug];
  }
  else {
    threadId = helper.deslugify(threadId);
    q += 'id = $1 ORDER BY p.created_at LIMIT 1';
    params = [threadId];
  }
  return db.sqlQuery(q, params)
  .then(function(rows) {
    if (rows && rows.length > 0) { return rows[0]; }
    else { return false; }
  })
  .then(function(firstPost) {
    if (firstPost && firstPost.user_id == userId && firstPost.moderated) {
      return true;
    }
    else { return false; }
  });
};
