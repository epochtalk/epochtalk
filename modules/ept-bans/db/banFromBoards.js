var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;
var Promise = require('bluebird');

module.exports = function(userId, boardIds) {
  var deslugifiedBoardIds = boardIds.map(function(boardId) { return helper.deslugify(boardId); });
  var deslugifiedUserId = helper.deslugify(userId);
  var q = 'INSERT INTO users.board_bans(user_id, board_id) SELECT $1, $2 WHERE NOT EXISTS (SELECT user_id, board_id FROM users.board_bans WHERE user_id = $1 AND board_id = $2)';
  return Promise.each(deslugifiedBoardIds, function(boardId) {
    var params = [ deslugifiedUserId, boardId ];
    return db.sqlQuery(q, params);
  })
  .then(function() { return { user_id: userId, board_ids: boardIds }; });
};
