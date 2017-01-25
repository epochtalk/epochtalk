var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(boardId) {
  boardId = helper.deslugify(boardId);
  var q = 'SELECT b.id, b.name, bm.parent_id, bm.category_id FROM boards b LEFT JOIN board_mapping bm ON b.id = bm.board_id WHERE b.id = $1';
  return db.sqlQuery(q, [boardId])
  .then(function(rows) {
    if (rows.length > 0) { return rows[0]; }
    else { return {}; }
  })
  .then(helper.slugify);
};
