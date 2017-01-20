var path = require('path');
var Promise = require('bluebird');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;
var NotFoundError = Promise.OperationalError;

/* return all values */
module.exports = function(id) {
  // TODO: optimize calls by merge both queries
  id = helper.deslugify(id);
  var q = 'SELECT u.id, u.username, u.email, u.passhash, u.confirmation_token, u.reset_token, u.reset_expiration, u.deleted, u.malicious_score, u.created_at, u.updated_at, u.imported_at, p.avatar, p.position, p.signature, p.raw_signature, p.fields, p.post_count FROM users u LEFT JOIN users.profiles p ON u.id = p.user_id WHERE u.id = $1';
  var params = [id];
  return db.sqlQuery(q, params)
  .then(function(rows) {
    if (rows.length > 0) { return rows[0]; }
    else { throw new NotFoundError('User Not Found'); }
  })
  .then(function(user) {
    var q = 'SELECT roles.* FROM roles_users, roles WHERE roles_users.user_id = $1 AND roles.id = roles_users.role_id';
    var q2 = 'SELECT roles.* FROM roles WHERE lookup = \'user\'';
    var allRoles = db.sqlQuery(q, [user.id]);
    var defaultRole = db.sqlQuery(q2);
    return Promise.join(allRoles, defaultRole, function(roles, userRole) {
      // return user's roles or default to the user role
      return roles.length ? roles : userRole;
    })
    .then(function(rows) { user.roles = rows; })
    .then(function() { return user; });
  })
  .then(helper.slugify);
};
