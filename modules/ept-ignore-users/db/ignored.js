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

  var q = `
  SELECT
    ui.ignored_user_id as id,
    ui.created_at as ignored_since,
    u.username,
    up.avatar,
    up.fields,
    True as ignored,
    (
      SELECT r.name as role_name
      FROM roles_users ru
      LEFT JOIN roles r ON ru.role_id = r.id
      WHERE ru.user_id = ui.ignored_user_id
      ORDER BY r.priority LIMIT 1
    ) as role,
    (
      SELECT r.highlight_color
      FROM roles_users ru
      LEFT JOIN roles r ON ru.role_id = r.id
      WHERE ru.user_id = ui.ignored_user_id
      ORDER BY r.priority LIMIT 1
    )
  FROM users.ignored ui
  LEFT JOIN users u ON ui.ignored_user_id = u.id
  LEFT JOIN users.profiles up ON ui.ignored_user_id = up.user_id
  WHERE ui.user_id = $1 ORDER BY ignored_since DESC
  LIMIT $2 OFFSET $3`;
  return db.sqlQuery(q, [userId, opts.limit, opts.offset])
  .then(helper.slugify);
};
