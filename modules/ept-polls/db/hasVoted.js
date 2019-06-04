var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(threadId, userId) {
  threadId = helper.deslugify(threadId);
  userId = helper.deslugify(userId);

  var q = 'SELECT EXISTS (SELECT 1 FROM poll_responses pr, poll_answers pa, polls p WHERE p.id = pa.poll_id AND pr.answer_id = pa.id AND p.thread_id = $1 AND pr.user_id = $2)';
  return db.sqlQuery(q, [threadId, userId])
  .then(function(rows) { return rows[0].exists; });
};
