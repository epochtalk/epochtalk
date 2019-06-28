var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(postId, roleLookup) {
  postId = helper.deslugify(postId);

  var q =
  `SELECT EXISTS (
  SELECT 1
  FROM roles r
  LEFT JOIN roles_users ru ON ru.role_id = r.id
  LEFT JOIN posts p ON ru.user_id = p.user_id
  WHERE p.id = $1
  AND r.lookup = $2);`;
  return db.sqlQuery(q, [postId, roleLookup])
  .then(function(rows) {
    if (rows[0].exists) { return true; }
    // If no rows are found check if the user has any roles, if not they are user role
    else if (roleLookup === 'user') {
      q = 'SELECT COUNT(*) FROM roles_users WHERE user_id = (SELECT p.user_id FROM posts p WHERE p.id = $1)';
      return db.scalar(q, [postId])
      .then(function(row) { return Number(row.count) === 0; });
    }
    else { return false; }
  });
};
