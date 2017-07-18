var path = require('path');
var Promise = require('bluebird');
var common = require(path.normalize(__dirname + '/../common'));
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

/* returns all values */
module.exports = function(username) {
  // TODO: optimize calls by merge both queries
  var q = `
    SELECT
      u.id,
      u.username,
      u.email,
      u.passhash,
      u.confirmation_token,
      u.reset_token,
      u.reset_expiration,
      u.deleted,
      u.malicious_score,
      u.created_at,
      u.updated_at,
      u.imported_at,
      CASE WHEN EXISTS (
        SELECT user_id
        FROM roles_users
        WHERE role_id = (SELECT id FROM roles WHERE lookup = \'banned\') and user_id = u.id
      )
      THEN (
        SELECT expiration
        FROM users.bans
        WHERE user_id = u.id
      )
      ELSE NULL END AS ban_expiration,
      p.avatar,
      p.position,
      p.signature,
      p.raw_signature,
      p.fields,
      p.post_count,
      p.last_active,
      pr.posts_per_page,
      pr.threads_per_page,
      pr.collapsed_categories
    FROM users u
    LEFT JOIN users.profiles p ON u.id = p.user_id
    LEFT JOIN users.preferences pr ON u.id = pr.user_id
    WHERE u.username = $1`;
  var params = [username];
  return db.sqlQuery(q, params)
  .then(function(rows) {
    if (rows.length > 0) { return common.formatUser(rows[0]); }
  })
  .then(function(user) {
    if (user) {
      var q = 'SELECT roles.* FROM roles_users, roles WHERE roles_users.user_id = $1 AND roles.id = roles_users.role_id';
      var q2 = 'SELECT roles.* FROM roles WHERE lookup = \'user\'';
      var allRoles = db.sqlQuery(q, [user.id]);
      var defaultRole = db.sqlQuery(q2);
      return Promise.join(allRoles, defaultRole, function(roles, userRole) {
        // return user's roles or default to the user role
        return roles.length ? roles : userRole;
      })
      .then(function(rows) { user.roles = rows; })
      .then(function() {
        if (user.collapsed_categories) {
          user.collapsed_categories = user.collapsed_categories.cats;
        }
        else { user.collapsed_categories = []; }
        user.avatar = user.avatar || null;
        return user;
      });
    }
  })
  .then(helper.slugify);
};

