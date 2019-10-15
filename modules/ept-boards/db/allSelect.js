var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;
var _ = require('lodash');

module.exports = function(userId, userPriority, admin) {
  var q = 'SELECT CASE WHEN category_id IS NULL THEN parent_id ELSE category_id END as parent_id, board_id as id, (SELECT viewable_by FROM boards WHERE board_id = id), (SELECT name FROM boards WHERE board_id = id), CASE WHEN category_id IS NULL THEN (SELECT name FROM boards WHERE parent_id = id) ELSE (SELECT name FROM categories WHERE category_id = id) END as parent_name, view_order FROM board_mapping';
  return db.sqlQuery(q)
  .then(helper.slugify)
  .then(function(boards) {
    boards = _.filter(boards, function(board) {
      if (board.viewable_by !== 0 && !board.viewable_by) { return true; }
      else { return userPriority <= board.viewable_by; }
    });

    if (admin) { return boards; }
    else { // filter out boards if user doesnt have admin permissions
      userId = helper.deslugify(userId);
      q = 'SELECT board_id FROM board_moderators WHERE user_id = $1';
      return db.sqlQuery(q, [userId])
      .map(function(data) { return helper.slugify(data.board_id); })
      .then(function(ids){
        boards = _.filter(boards, function(board) {
          return ids.includes(board.id);
        });
        return boards;
      })
    }
  });
};
