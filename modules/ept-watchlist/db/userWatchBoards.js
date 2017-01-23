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

  var q = 'SELECT b.id, b.name, b.post_count, b.thread_count  ';
  q += 'FROM users.watch_boards wb ';
  q += 'LEFT JOIN boards b ON wb.board_id = b.id ';
  q += 'WHERE user_id = $1 ';
  q += 'LIMIT $2 OFFSET $3';
  return db.sqlQuery(q, [userId, opts.limit, opts.offset])
  .then(helper.slugify);
};
