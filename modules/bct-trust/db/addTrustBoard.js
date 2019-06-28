var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(boardId) {
  var q = 'INSERT INTO trust_boards (board_id) VALUES($1) ON CONFLICT (board_id) DO NOTHING';
  return db.sqlQuery(q, [helper.deslugify(boardId)])
  .then(function() { return boardId; });
};
