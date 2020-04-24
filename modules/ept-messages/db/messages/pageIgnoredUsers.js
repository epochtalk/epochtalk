var path = require('path');
var dbc = require(path.normalize(__dirname + '/../db'));
var helper = dbc.helper;
var db = dbc.db;

module.exports = function(userId, opts) {
  userId = helper.deslugify(userId);
  var limit = opts.limit || 25;
  var page = opts.page || 1;
  var offset = (page * limit) - limit;
  var results = {
    page: page,
    limit: limit,
    prev: page > 1
  };
  limit = limit + 1;
  var q = `SELECT u.username, u.id, up.avatar, True as ignored
    FROM messages.ignored i
    JOIN users u ON (u.id = i.ignored_user_id)
    JOIN users.profiles up ON (up.user_id = i.ignored_user_id)
    WHERE i.user_id = $1 LIMIT $2 OFFSET $3`;
  return db.sqlQuery(q, [userId, limit, offset])
  .then(function(data) {
    results.next = data.length === limit;
    if (results.next) { data.pop(); }
    results.data = data;
    return results;
  })
  .then(helper.slugify);
}
;

