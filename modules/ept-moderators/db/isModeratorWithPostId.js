var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(userId, postId) {
  userId = helper.deslugify(userId);
  postId = helper.deslugify(postId);

  var q = 'SELECT bm.user_id FROM board_moderators bm LEFT JOIN boards b ON bm.board_id = b.id LEFT JOIN threads t ON b.id = t.board_id LEFT JOIN posts p ON p.thread_id = t.id WHERE bm.user_id = $1 AND p.id = $2';
  return db.sqlQuery(q, [userId, postId])
  .then(function(rows) {
    if (rows.length > 0) { return true; }
    else { return false; }
  });
};
