var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;
var errors = dbc.errors;
var NotFoundError = errors.NotFoundError;

module.exports = function(threadId, userPriority, slug) {
  var q = 'SELECT board_id FROM threads WHERE ';
  var params;
  if (slug) {
    q += 'slug = $1';
    params = [slug];
  }
  else {
    threadId = helper.deslugify(threadId);
    q += 'id = $1';
    params = [threadId];
  }

  return db.sqlQuery(q, params)
  .then(function(rows) {
    if (rows.length > 0 ) { return rows[0].board_id; }
    else { throw new NotFoundError(); }
  })
  .then(function(boardId) {
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
  })
  .error(function() { return false; });
};
