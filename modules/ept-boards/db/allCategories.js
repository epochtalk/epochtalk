var _ = require('lodash');
var path = require('path');
var common = require(path.normalize(__dirname + '/../common'));
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(userPriority, opts) {
  // get all categories
  var categories;
  opts = opts || {};
  return db.sqlQuery('SELECT * FROM categories')
  .then(function(dbCategories) { categories = dbCategories; })
  // get all board mappings
  .then(function() {
    var q = `SELECT * FROM (
      SELECT
        b.id,
        b.name,
        b.description,
        b.viewable_by,
        b.postable_by,
        b.right_to_left,
        (b.meta ->> 'disable_post_edit')::int as disable_post_edit,
        b.thread_count,
        b.post_count,
        b.created_at,
        b.updated_at,
        b.imported_at,
        mb.last_thread_id,
        bm.parent_id,
        bm.category_id,
        bm.view_order
      FROM board_mapping bm
      LEFT JOIN boards b ON bm.board_id = b.id
      LEFT JOIN metadata.boards mb ON b.id = mb.board_id
    ) blist
    LEFT JOIN LATERAL (
      SELECT pf.content ->> 'title' as last_thread_title
      FROM posts pf
      WHERE pf.thread_id = blist.last_thread_id
      ORDER BY pf.created_at
      LIMIT 1
    ) pfirst ON true
    LEFT JOIN LATERAL (
      SELECT
        pl.deleted as post_deleted,
        pl.created_at as last_post_created_at,
        pl.position as last_post_position,
        u.username as last_post_username,
        up.avatar as last_post_avatar,
        u.id as user_id,
        u.deleted as user_deleted
      FROM posts pl
      LEFT JOIN users u ON pl.user_id = u.id
      LEFT JOIN users.profiles up ON pl.user_id = up.user_id
      WHERE blist.last_thread_id = pl.thread_id
      ORDER BY pl.created_at DESC
      LIMIT 1
    ) plast ON true
    LEFT JOIN LATERAL (
      SELECT json_agg(
        row_to_json(
          (SELECT x FROM ( SELECT bm.user_id as id, u.username as username) x )
        )
      ) as moderators
      FROM board_moderators bm
      LEFT JOIN users u ON bm.user_id = u.id
      WHERE bm.board_id = blist.id
    ) mods on true;`;
    if (opts.stripped) {
      q = 'SELECT b.id, b.name, b.viewable_by, bm.parent_id, bm.category_id, bm.view_order FROM board_mapping bm LEFT JOIN boards b ON bm.board_id = b.id';
    }
    return db.sqlQuery(q);
  })
  // handle deleted users
  .then(function(boards) {
    if (opts.stripped) { return boards; }
    return boards.map(function(board) {
      if (board.post_deleted || board.user_deleted || !board.user_id) {
        board.last_post_username = 'deleted';
      }
      if (!board.user_id) {
        board.last_post_username = undefined;
        board.last_post_avatar = undefined;
        board.last_post_created_at = undefined;
        board.last_thread_id = undefined;
        board.last_thread_title = undefined;
        board.last_post_position = undefined;
      }
      return board;
    });
  })
  // stitch boards together
  .then(function(boardMapping) {
    return categories.map(function(category) {
      // get all child boards for this category
      category.boards = _.filter(boardMapping, function(board) {
        return board.category_id === category.id;
      });

      // sort by view_order
      category.boards = _.sortBy(category.boards, 'view_order');

      // Filter out private boards
      if (opts.hidePrivate) {
        // remove boards not matching user priority
        category.boards = _.filter(category.boards, function(board) {
          if (board.viewable_by !== 0 && !board.viewable_by) { return true; }
          else { return userPriority <= board.viewable_by; }
        });
      }

      // recurse through category boards
      category.boards.map(function(board) {
        return common.boardStitching(boardMapping, board, userPriority, opts);
      });

      // return category
      return category;
    });
  })
  // sort categories by view_order
  .then(function() { categories = _.sortBy(categories, 'view_order'); })
  // remove categories not matching user priority
  .then(function() {
    if (opts.hidePrivate) {
      categories = _.filter(categories, function(category) {
        if (category.viewable_by !== 0 && !category.viewable_by) { return true; }
        else { return userPriority <= category.viewable_by; }
      });
    }
  })
  .then(function() { return helper.slugify(categories); });
};
