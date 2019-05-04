var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;
var Promise = require('bluebird');
var using = Promise.using;

/* returns user with removed role(s) */
module.exports = function(userId, roleId) {
  userId = helper.deslugify(userId);
  roleId = helper.deslugify(roleId);
  var q = 'SELECT id, username, email, created_at, updated_at FROM users WHERE id = $1';
  var params = [ userId ];
  var updatedUser;
  return using(db.createTransaction(), function(client) {
    return client.query(q, params)
    .then(function(results) { // fetch user and ensure user exists
      var rows = results.rows;
      if (rows.length > 0) { return rows[0]; } // return user
      else { return Promise.reject(); } // user doesnt exist
    })
    .then(function(user) {
      updatedUser = user;
      q = 'DELETE FROM roles_users WHERE role_id = $1 AND user_id = $2';
      params = [roleId, user.id];
      return client.query(q, params);
    })
    .then(function() {
      q = 'SELECT lookup FROM roles WHERE id = $1';
      return client.query(q, [roleId]);
    })
    .then(function(results) {
      var rows = results.rows;
      // Remove ban from users.ban table if the role being removed is the banned role
      if (rows.length && rows[0].lookup === 'banned') {
        q = 'UPDATE users.bans SET expiration = now(), updated_at = now() WHERE user_id = $1';
        return client.query(q, [userId]);
      }
      return;
    })
    .then(function() { // append roles to updated user and return
      q = 'SELECT roles.* FROM roles_users, roles WHERE roles_users.user_id = $1 AND roles.id = roles_users.role_id';
      params = [userId];
      return client.query(q, params);
    })
    .then(function(results) {
      updatedUser.roles = results.rows;
      return updatedUser;
    });
  })
  .then(helper.slugify);
};
