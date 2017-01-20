var path = require('path');
var Promise = require('bluebird');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(opts) {
  opts = opts || {};
  var userId = helper.deslugify(opts.userId);
  var priority = opts.priority;

  var q = 'SELECT count(id) ' +
  'FROM ( ' +
    'SELECT temp.id FROM (' +
      'SELECT DISTINCT (p.thread_id) AS id ' +
      'FROM posts p ' +
      'WHERE p.user_id = $1 ' +
    ') AS temp ' +
    'LEFT JOIN threads t ON temp.id = t.id ' +
    'WHERE EXISTS ( ' +
      'SELECT 1 ' +
      'FROM boards b ' +
      'WHERE b.id = t.board_id ' +
      'AND (b.viewable_by IS NULL OR b.viewable_by >= $2 ) ) ' +
    'AND t.updated_at IS NOT NULL ' +
    'ORDER BY t.updated_at DESC ' +
  ') tlist ';
  var params = [userId, priority];
  return db.sqlQuery(q, params)
  .then(function(rows) {
    if (rows.length > 0) { return Number(rows[0].count); }
    else { return 0; }
  });
};
