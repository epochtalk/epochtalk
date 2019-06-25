var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(boardId) {
  var q = 'DELETE FROM trust_boards WHERE board_id = $1';
  return db.sqlQuery(q, [helper.deslugify(boardId)])
  .then(function() { return boardId; });
};
