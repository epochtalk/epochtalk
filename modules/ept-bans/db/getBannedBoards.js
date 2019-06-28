var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(username) {
  var q = 'SELECT b.id, b.name FROM users.board_bans JOIN boards b ON board_id = b.id WHERE user_id = (SELECT id from users WHERE username = $1)';
  var params = [ username ];
  return db.sqlQuery(q, params)
  .then(helper.slugify);
};
