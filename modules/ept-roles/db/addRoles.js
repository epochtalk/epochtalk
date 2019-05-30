var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;
var Promise = require('bluebird');
var using = Promise.using;

/* returns user with added role(s) */
module.exports = function(usernames, roleId) {
  roleId = helper.deslugify(roleId);
  var q = 'SELECT id, username, email, created_at, updated_at FROM users WHERE username = ANY($1::text[])';
  var params = [ usernames ];
  return using(db.createTransaction(), function(client) {
    return client.query(q, params)
    .then(function(results) { // fetch user and ensure user exists
      var rows = results.rows;
      if (rows.length > 0) { return rows; } // return role names to be mapped
      else { return Promise.reject(); } // users dont exist
    })
    .then(function(users) {
      return Promise.map(users,
        function(user) { // insert userid and roleid into roles_users if it doesnt exist already
          q = 'INSERT INTO roles_users(role_id, user_id) SELECT $1, $2 WHERE NOT EXISTS (SELECT 1 FROM roles_users WHERE role_id = $1 AND user_id = $2);';
          params = [roleId, user.id];
          return client.query(q, params)
          .then(function() { // append roles to updated user and return
            q = 'SELECT roles.* FROM roles_users, roles WHERE roles_users.user_id = $1 AND roles.id = roles_users.role_id';
            params = [user.id];
            return client.query(q, params);
          })
          .then(function(results) {
            user.roles = results.rows;
            return user;
          });
        }
      );
    }).then(function(allUsers) { return allUsers; });
  })
  .then(helper.slugify);
};
