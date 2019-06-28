var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(roleId, opts) {
  roleId = helper.deslugify(roleId);
  var q = 'SELECT u.id, u.username, u.email FROM users u LEFT JOIN roles_users ru ON u.id = ru.user_id WHERE ru.role_id = $1';
  opts = opts || {};
  var limit = opts.limit || 25;
  var page = opts.page || 1;
  var offset = (page * limit) - limit;
  var params;
  var userData = {};
  if (opts && opts.searchStr) {
    q = [q, 'AND u.username LIKE $2 ORDER BY username LIMIT $3 OFFSET $4'].join(' ');
    params = [roleId, opts.searchStr + '%', limit, offset];
  }
  else {
    q = [q, 'ORDER BY username LIMIT $2 OFFSET $3'].join(' ');
    params = [roleId, limit, offset];
  }
  return db.sqlQuery(q, params)
  .map(function(user) {
    var q = 'SELECT roles.* FROM roles_users, roles WHERE roles_users.user_id = $1 AND roles.id = roles_users.role_id';
    var params = [user.id];
    return db.sqlQuery(q, params)
    .then(function(rows) { user.roles = rows; })
    .then(function() { return user; });
  })
  .then(function(users) {
    userData.users = users;
    return users;
  })
  .then(function() {
    if (opts && opts.searchStr) {
      q = 'SELECT COUNT(u.id) FROM users u LEFT JOIN roles_users ru ON u.id = ru.user_id WHERE ru.role_id = $1 AND u.username LIKE $2';
      params = [roleId, opts.searchStr + '%'];
    }
    else {
      q = 'SELECT COUNT(u.id) FROM users u LEFT JOIN roles_users ru ON u.id = ru.user_id WHERE ru.role_id = $1';
      params = [roleId];
    }
    return db.scalar(q, params);
  })
  .then(function(row) {
    userData.count = Number(row.count);
    return userData;
  })
  .then(helper.slugify);
};
