var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(userId, threadId) {
  userId = helper.deslugify(userId);
  threadId = helper.deslugify(threadId);
  var q = 'DELETE FROM users.watch_threads WHERE user_id = $1 AND thread_id = $2';
  return db.scalar(q, [userId, threadId])
  .then(function() {
    return {
      user_id: userId,
      thread_id: threadId
    };
  })
  .then(helper.slugify);
};
