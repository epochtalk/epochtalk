var path = require('path');
var Promise = require('bluebird');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;
var using = Promise.using;

module.exports = function(usernames, boardId) {
  boardId = helper.deslugify(boardId);
  var q = 'SELECT id, username FROM users WHERE username = ANY($1::text[])';
  var params = [ usernames ];
  return using(db.createTransaction(), function(client) {
    return client.query(q, params)
    .then(function(results) {
      var rows = results.rows;
      if (rows.length > 0) { return rows; }
      else { return Promise.reject(); }
    })
    .then(function(users) {
      return Promise.map(users,
        function(user) {
          q = 'INSERT INTO board_moderators (user_id, board_id) SELECT $1, $2 WHERE NOT EXISTS (SELECT 1 FROM board_moderators WHERE user_id = $1 AND board_id = $2);';
          params = [ user.id, boardId ];
          return client.query(q, params)
          .then(function() { return user; });
        }
      );
    })
    .then(function(users) {
      return Promise.map(users,
        function(user) {
          q = 'SELECT roles.* FROM roles_users, roles WHERE roles_users.user_id = $1 AND roles.id = roles_users.role_id';
          params = [user.id];
          return client.query(q, params)
          .then(function(results) {
            user.roles = results.rows || [];
            return user;
          });
        }
      );
    });
  })
  .then(helper.slugify);
};
