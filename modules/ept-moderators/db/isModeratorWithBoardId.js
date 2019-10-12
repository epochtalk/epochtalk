var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(userId, threadId) {
  userId = helper.deslugify(userId);
  threadId = helper.deslugify(threadId);

  var q = 'SELECT bm.user_id FROM board_moderators bm WHERE bm.user_id = $1 AND bm.board_id = $2';
  return db.sqlQuery(q, [userId, threadId])
  .then(function(rows) {
    if (rows.length > 0) { return true; }
    else { return false; }
  });
};
