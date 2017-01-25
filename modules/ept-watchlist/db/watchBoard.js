var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(userId, boardId) {
  userId = helper.deslugify(userId);
  boardId = helper.deslugify(boardId);
  var q = 'INSERT INTO users.watch_boards (user_id, board_id) VALUES ($1, $2)';
  return db.sqlQuery(q, [userId, boardId])
  .then(function() { return; });
};
