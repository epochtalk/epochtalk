var path = require('path');
var Promise = require('bluebird');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;
var using = Promise.using;
var errors = dbc.errors;
var NotFoundError = errors.NotFoundError;

module.exports = function(catId) {
  catId = helper.deslugify(catId);
  return using(db.createTransaction(), function(client) {
    var q = 'SELECT * FROM categories WHERE id = $1 FOR UPDATE';
    return client.queryAsync(q, [catId])
    .then(function(results) {
      if (results.rows.length > 0) { return results.rows[0]; }
      else { throw new NotFoundError('Category Not Found'); }
    })
    .then(function() {
      q = `WITH RECURSIVE find_boards(board_id, parent_id, category_id) AS (
        SELECT bm.board_id, bm.parent_id, bm.category_id
        FROM board_mapping bm
        WHERE bm.category_id = $1
        UNION ALL
        SELECT bm.board_id, bm.parent_id, bm.category_id
        FROM find_boards fb, board_mapping bm
        WHERE bm.parent_id = fb.board_id
      )
      DELETE FROM board_mapping
      WHERE board_id IN ( SELECT board_id FROM find_boards )`;
      return client.queryAsync(q, [catId]);
    })
    .then(function() {
      q = 'DELETE FROM categories WHERE id = $1';
      return client.queryAsync(q, [catId]);
    });
  });
};
