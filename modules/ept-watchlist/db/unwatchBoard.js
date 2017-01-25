var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(userId, boardId) {
  userId = helper.deslugify(userId);
  boardId = helper.deslugify(boardId);
  var q = 'DELETE FROM users.watch_boards WHERE user_id = $1 AND board_id = $2';
  return db.sqlQuery(q, [userId, boardId])
  .then(function() { return; });
};
