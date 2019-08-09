var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;
var Promise = require('bluebird');
var using = Promise.using;

module.exports = function(userId, expiration) {
  userId = helper.deslugify(userId);
  var q = 'SELECT id FROM users.bans WHERE user_id = $1';
  var params = [userId];
  var returnObj;
  expiration = expiration ? expiration : new Date(8640000000000000); // permanent ban
  return using(db.createTransaction(), function(client) {
    return client.query(q, params)
    .then(function(results) {
      var rows = results.rows;
      if (rows.length > 0) { // user has been previously banned
        q = 'UPDATE users.bans SET expiration = $1, updated_at = now() WHERE user_id = $2 RETURNING id, user_id, expiration, created_at, updated_at';
        params = [expiration, userId];
      }
      else { // user has never been banned
        q = 'INSERT INTO users.bans(user_id, expiration, created_at, updated_at) VALUES($1, $2, now(), now()) RETURNING id, user_id, expiration, created_at, updated_at';
        params = [userId, expiration];
      }
      return client.query(q, params);
    })
    .then(function(results) {
      var rows = results.rows;
      if (rows.length > 0) {
        returnObj = rows[0];
        return;
      }
    })
    .then(function() { // lookup the banned role id to add to user
      q = 'SELECT id FROM roles where lookup = $1';
      return client.query(q, ['banned']);
    })
    .then(function(results) {
      var rows = results.rows;
      if (rows.length > 0) { return rows[0].id; }
    })
    .then(function(bannedRoleId) {
      q = 'INSERT INTO roles_users(role_id, user_id) SELECT $1, $2 WHERE NOT EXISTS (SELECT 1 FROM roles_users WHERE role_id = $1 AND user_id = $2);';
      params = [bannedRoleId, userId];
      return client.query(q, params)
      .then(function() { // append roles to updated user and return
        q = 'SELECT roles.* FROM roles_users, roles WHERE roles_users.user_id = $1 AND roles.id = roles_users.role_id';
        params = [userId];
        return client.query(q, params);
      })
      .then(function(results) {
        returnObj.roles = results.rows;
        return returnObj;
      });
    });
  })
  .then(helper.slugify);
};
