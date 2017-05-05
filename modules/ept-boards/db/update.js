var path = require('path');
var Promise = require('bluebird');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;
var using = Promise.using;
var errors = dbc.errors;
var NotFoundError = errors.NotFoundError;

module.exports = function(board) {
  board = helper.deslugify(board);
  var q, params;
  return using(db.createTransaction(), function(client) {
    q = 'SELECT * FROM boards WHERE id = $1 FOR UPDATE';
    return client.queryAsync(q, [board.id])
    .then(function(results) {
      if (results.rows.length > 0) { return results.rows[0]; }
      else { throw new NotFoundError('Board Not Found'); }
    })
    .then(function(oldBoard) {
      board.name = board.name || oldBoard.name;
      helper.updateAssign(board, oldBoard, board, 'description');
      helper.updateAssign(board, oldBoard, board, 'viewable_by');
      helper.updateAssign(board, oldBoard, board, 'postable_by');
    })
    .then(function() {
      q = 'UPDATE boards SET name = $1, description = $2, viewable_by = $3, postable_by = $4, updated_at = now() WHERE id = $5';
      params = [board.name, board.description || '', board.viewable_by, board.postable_by, board.id];
      return client.queryAsync(q, params);
    });
  })
  .then(function() { return helper.slugify(board); });
};
