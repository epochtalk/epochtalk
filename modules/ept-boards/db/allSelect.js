var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function() {
  return db.sqlQuery('SELECT CASE WHEN category_id IS NULL THEN parent_id ELSE category_id END as parent_id, board_id as id, (SELECT name FROM boards WHERE board_id = id), CASE WHEN category_id IS NULL THEN (SELECT name FROM boards WHERE parent_id = id) ELSE (SELECT name FROM categories WHERE category_id = id) END as parent_name, view_order FROM board_mapping')
  .then(helper.slugify);
};
