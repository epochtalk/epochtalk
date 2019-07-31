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
    })
    .then(function(users) {
      return Promise.map(users,
        function(user) {
          q = 'DELETE FROM board_moderators WHERE user_id = $1 AND board_id = $2';
          params = [ user.id, boardId ];
          return client.query(q, params)
          .then(function() {  return user; });
        }
      );
    });
  })
  .then(helper.slugify);
};
