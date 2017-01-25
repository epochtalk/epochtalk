var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(boardId, userId) {
  boardId = helper.deslugify(boardId);
  userId = helper.deslugify(userId);

  var q = 'SELECT board_id FROM users.watch_boards WHERE board_id = $1 AND user_id = $2';
  return db.sqlQuery(q, [boardId, userId])
  .then(function(rows) {
    if (rows.length > 0) { return true; }
    else { return false; }
  });
};
