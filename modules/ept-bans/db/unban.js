var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;
var Promise = require('bluebird');
var using = Promise.using;

module.exports = function(userId) {
  userId = helper.deslugify(userId);
  var q = 'UPDATE users.bans SET expiration = now(), updated_at = now() WHERE user_id = $1 RETURNING id, user_id, expiration, created_at, updated_at';
  var params = [userId];
  var returnObj;
  return using(db.createTransaction(), function(client) {
    return client.query(q, params)
    .then(function(results) {
      var rows = results.rows;
      if (rows.length > 0) {
        returnObj = rows[0];
        return;
      }
      else { return Promise.reject(); }
    })
    .then(function() {
      q = 'UPDATE users SET malicious_score = null WHERE id = $1';
      return client.query(q, [ userId ]);
    })
    .then(function() { // lookup the banned role id
      q = 'SELECT id FROM roles where lookup = $1';
      return client.query(q, ['banned']);
    })
    .then(function(results) {
      var rows = results.rows;
      if (rows.length > 0) { return rows[0].id; }
      else { return Promise.reject(); }
    })
    .then(function(bannedRoleId) {
      q = 'DELETE FROM roles_users WHERE role_id = $1 AND user_id = $2';
      params = [bannedRoleId, userId];
      return client.query(q, params);
    })
    .then(function() { // append roles to updated user and return
      q = 'SELECT roles.* FROM roles_users, roles WHERE roles_users.user_id = $1 AND roles.id = roles_users.role_id';
      params = [userId];
      return client.query(q, params);
    })
    .then(function(results) {
      returnObj.roles = results.rows;
      return returnObj;
    });
  })
  .then(helper.slugify);
};
