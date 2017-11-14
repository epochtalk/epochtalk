var path = require('path');
var bcrypt = require('bcrypt');
var Promise = require('bluebird');
var dbc = require(path.normalize(__dirname + '/db'));
var common = require(path.normalize(__dirname + '/../common'));
var db = dbc.db;
var helper = dbc.helper;
var using = Promise.using;
var errors = dbc.errors;
var CreationError = errors.CreationError;

/* returns values including email, confirm token, and roles */
module.exports = function(user, isAdmin) {
  var q, params, passhash;
  if (user.password) { passhash = bcrypt.hashSync(user.password, 12); }
  delete user.password;

  return using(db.createTransaction(), function(client) {
    // insert user
    q = 'INSERT INTO users(email, username, passhash, confirmation_token, created_at, updated_at) VALUES($1, $2, $3, $4, now(), now()) RETURNING id';
    params = [user.email, user.username, passhash, user.confirmation_token];
    return client.query(q, params)
    .then(function(results) {
      if (results.rows.length > 0) { user.id = results.rows[0].id; }
      else { throw new CreationError('User Could Not Be Created'); }
    })
    // insert default user role
    .then(function() {
      q = 'INSERT INTO roles_users(role_id, user_id) VALUES($1, $2)';
      if (isAdmin) {
        var superAdminRole = '8ab5ef49-c2ce-4421-9524-bb45f289d42c';
        return client.query(q, [superAdminRole, user.id]);
      }
    })
    .then(function() { return common.insertUserProfile(user, client); })
    // Query for users roles
    .then(function() {
      q = 'SELECT roles.* FROM roles_users, roles WHERE roles_users.user_id = $1 AND roles.id = roles_users.role_id';
      return client.query(q, [user.id])
      .then(function(results) { user.roles = results.rows; });
    });
  })
  .then(function() { return helper.slugify(user); });
};
