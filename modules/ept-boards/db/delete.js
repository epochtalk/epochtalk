var path = require('path');
var Promise = require('bluebird');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;
var using = Promise.using;

/**
 * This sets off a cascade delete that also sets off the delete triggers
 * for both threads and posts. This should properly update all the metadata
 * across the db. The only side effect is that the metadata.boards row needs
 * to be deleted before the board row. This is because the threads delete has
 * a pre trigger that tries to update the metadata.boards row, but at that
 * point, the board no longer exists causing an exception to be raised on
 * that constraint. The proper fix would be to merge all the metadata tables
 * back into the modal tables.
 */
module.exports = function(boardId){
  boardId = helper.deslugify(boardId);
  var q;

  return using(db.createTransaction(), function(client) {
    // Remove board data from DB
    q = 'WITH RECURSIVE find_boards(board_id, parent_id, category_id) AS ( SELECT bm.board_id, bm.parent_id, bm.category_id FROM board_mapping bm WHERE bm.board_id = $1 UNION ALL SELECT bm.board_id, bm.parent_id, bm.category_id FROM find_boards fb, board_mapping bm WHERE bm.parent_id = fb.board_id ) DELETE FROM board_mapping WHERE board_id IN ( SELECT board_id FROM find_boards )';
    return client.queryAsync(q, [boardId])
    .then(function() {
      q = 'DELETE FROM metadata.boards WHERE board_id = $1';
      return client.queryAsync(q, [boardId]);
    })
    .then(function() {
      q = 'DELETE FROM boards WHERE id = $1 RETURNING name';
      return client.queryAsync(q, [boardId]);
    })
    .then(function(results) {
      return {
        name: results.rows[0].name,
        id: boardId
      };
    });
  })
  .then(helper.slugify);
};
