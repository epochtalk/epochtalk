var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(boardId, userPriority) {
  boardId = helper.deslugify(boardId);

  var q =
  `WITH RECURSIVE find_parent(board_id, parent_id, category_id) AS (
    SELECT bm.board_id, bm.parent_id, bm.category_id
    FROM board_mapping bm where board_id = $1
    UNION
    SELECT bm.board_id, bm.parent_id, bm.category_id
    FROM board_mapping bm, find_parent fp
    WHERE bm.board_id = fp.parent_id
  )
  SELECT
    fp.board_id,
    fp.parent_id,
    fp.category_id,
    b.viewable_by as board_viewable,
    c.viewable_by as cat_viewable
  FROM find_parent fp
  LEFT JOIN boards b on fp.board_id = b.id
  LEFT JOIN categories c on fp.category_id = c.id`;
  return db.sqlQuery(q, [boardId])
  .then(function(rows) {
    var visible = false;
    if (rows.length < 1) { return visible; }

    var boardsViewable = true;
    var catsViewable = true;
    rows.forEach(function(row) {
      var boardPriority = row.board_viewable;
      if (typeof boardPriority === 'number' && userPriority > boardPriority) {
        boardsViewable = false;
      }

      var catPriority = row.cat_viewable;
      if (typeof catPriority === 'number' && userPriority > catPriority) {
        catsViewable = false;
      }
    });

    if (boardsViewable && catsViewable) { visible = true; }
    return visible;
  });
};
