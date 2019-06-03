var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(opts) {
  // Defaults
  var limit = 25;
  var page = 1;

  if (opts.limit) { limit = opts.limit; }
  else { opts.limit = limit; }
  if (opts.page) { page = opts.page; }
  else { opts.page = page; }

  // Build results object for return
  var results = Object.assign({}, opts);
  results.prev = results.page > 1 ? results.page - 1 : undefined;

  // Base Query
  var q = 'SELECT id, author_id, (SELECT username FROM users WHERE id = author_id) AS author_name, (SELECT avatar FROM users.profiles WHERE user_id = author_id) AS author_avatar, (SELECT r.highlight_color FROM roles_users ru LEFT JOIN roles r ON ru.role_id = r.id WHERE author_id = ru.user_id ORDER BY r.priority LIMIT 1) as author_highlight_color, note, created_at, updated_at FROM user_notes WHERE user_id = $1 ORDER BY created_at DESC OFFSET $2 LIMIT $3';

  // Calculate pagination vars
  var offset = (page * limit) - limit;
  limit = limit + 1; // query one extra result to see if theres another page

  // Assign query params
  var params = [ helper.deslugify(opts.user_id), offset, limit ];
  return db.sqlQuery(q, params)
  .then(function(data) {
    // Check for next page then remove extra record
    if (data.length === limit) {
      results.next = page + 1;
      data.pop();
    }
    results.data = helper.slugify(data);
    return results;
  });
};
