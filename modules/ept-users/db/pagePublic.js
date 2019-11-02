var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

/* returns a limited set of users depending on limit and page */
module.exports = function(opts) {
  // Hides banned role, banned user roles are returned as 'User' role
  var q = 'SELECT u.id, u.username, u.created_at, p.avatar, p.post_count, CASE WHEN EXISTS (SELECT role_id FROM roles_users WHERE u.id = user_id AND role_id != \'67aaa01e-cc74-4c3d-9b3f-56a6f6547098\') THEN (SELECT r.name FROM roles r WHERE r.id = (SELECT role_id FROM roles_users WHERE u.id = user_id AND role_id != \'67aaa01e-cc74-4c3d-9b3f-56a6f6547098\' ORDER BY priority ASC LIMIT 1)) ELSE (SELECT name FROM roles WHERE lookup = \'user\') END as role, CASE WHEN EXISTS (SELECT role_id FROM roles_users WHERE u.id = user_id AND role_id != \'67aaa01e-cc74-4c3d-9b3f-56a6f6547098\') THEN (SELECT r.priority FROM roles r WHERE r.id = (SELECT role_id FROM roles_users WHERE u.id = user_id AND role_id != \'67aaa01e-cc74-4c3d-9b3f-56a6f6547098\' ORDER BY priority ASC LIMIT 1)) ELSE (SELECT priority FROM roles WHERE lookup = \'user\') END as priority FROM users u LEFT JOIN users.profiles p ON u.id = p.user_id';

  opts = opts || {};
  var limit = opts.limit || 25;
  var page = opts.page || 1;
  var offset = (page * limit) - limit;
  var sortField = opts.sortField || 'username';
  var sort = sortField;
  var desc = opts.desc ? 'DESC' : 'ASC';
  var orderParam = desc;
  if (sort === 'role') {
    sort = 'priority';
    // invert sorting so 0 is highest priority
    orderParam = desc === 'DESC' ? 'ASC' : 'DESC';
  }
  var params;
  if (opts && opts.searchStr) {
    // weight search results to return results in correct order
    if (sort === 'username') {
      sort = `CASE
        WHEN username LIKE '${opts.searchStr}' THEN 1
        WHEN username LIKE '${opts.searchStr}%' THEN 2
        WHEN username LIKE '%${opts.searchStr}%' THEN 3
        ELSE 4
      END`;
    }
    q = [q, 'WHERE u.deleted = false AND u.username LIKE $1 ORDER BY', sort, orderParam, 'LIMIT $2 OFFSET $3'].join(' ');
    params = ['%' + opts.searchStr + '%', limit, offset];
  }
  else {
    q = [q, 'WHERE u.deleted = false ORDER BY', sort, orderParam, 'LIMIT $1 OFFSET $2'].join(' ');
    params = [limit, offset];
  }

  var result = {};
  return db.sqlQuery(q, params)
  .then(function(users) {
    result.users = users;
    q = 'SELECT count(*) FROM users u';
    if (opts && opts.searchStr) {
      q += ' WHERE u.deleted = false AND u.username LIKE $1';
      params = ['%' + opts.searchStr + '%'];
      return db.scalar(q, params);
    }
    else { return db.scalar(q); }
  })
  .then(function(userCount) {
    result.count = Number(userCount.count) || 0;
    result.page = page;
    result.limit = limit;
    result.field = sortField;
    result.desc = desc === 'DESC';
    result.search = opts.searchStr;
    result.page_count =  Math.ceil(userCount.count / limit);
    return result;
  })
  .then(helper.slugify);
};
