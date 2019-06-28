var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function() {
  var q = 'SELECT board_id FROM trust_boards';
  return db.sqlQuery(q)
  .map(function(row) { return helper.slugify(row.board_id); });
};
