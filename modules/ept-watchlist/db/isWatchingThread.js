var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(threadId, userId) {
  threadId = helper.deslugify(threadId);
  userId = helper.deslugify(userId);

  var q = 'SELECT thread_id FROM users.watch_threads WHERE thread_id = $1 AND user_id = $2';
  return db.sqlQuery(q, [threadId, userId])
  .then(function(rows) {
    if (rows.length > 0) { return true; }
    else { return false; }
  });
};
