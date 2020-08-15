var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(userId, opts) {
  userId = helper.deslugify(userId);

  opts = opts || {};
  opts.limit = opts.limit || 25;
  opts.page = opts.page || 1;
  opts.offset = (opts.page * opts.limit) - opts.limit;
  opts.limit += 1; // hasMore check

  var q = 'SELECT t.id, t.slug, t.post_count, mt.views as view_count, b.name as board_name, ';
  q += '( SELECT content->\'title\' FROM posts WHERE thread_id = wt.thread_id ORDER BY created_at LIMIT 1 ) as title ';
  q += 'FROM users.watch_threads wt ';
  q += 'LEFT JOIN threads t ON wt.thread_id = t.id ';
  q += 'LEFT JOIN metadata.threads mt ON wt.thread_id = mt.thread_id ';
  q += 'LEFT JOIN boards b ON t.board_id = b.id ';
  q += 'WHERE wt.user_id = $1 LIMIT $2 OFFSET $3';
  return db.sqlQuery(q, [userId, opts.limit, opts.offset])
  .then(helper.slugify);
};
