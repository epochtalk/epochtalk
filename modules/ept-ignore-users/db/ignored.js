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

  var results = {
    page: opts.page,
    limit: opts.limit,
    prev: opts.page > 1
  };

  opts.limit += 1;

  var q = `
  SELECT
    ui.ignored_user_id as id,
    ui.created_at as ignored_since,
    u.username,
    up.avatar,
    True as ignored
  FROM users.ignored ui
  LEFT JOIN users u ON ui.ignored_user_id = u.id
  LEFT JOIN users.profiles up ON ui.ignored_user_id = up.user_id
  WHERE ui.user_id = $1 ORDER BY ignored_since DESC
  LIMIT $2 OFFSET $3`;
  return db.sqlQuery(q, [userId, opts.limit, opts.offset])
  .then(function(data) {
    results.next = data.length === opts.limit;
    if (results.next) { data.pop(); }
    results.data = data;
    return results;
  })
  .then(helper.slugify);
};
