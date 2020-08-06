var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(threadId, userId, slug) {
  userId = helper.deslugify(userId);
  var q, params;
  if (slug) {
    var q = 'SELECT EXISTS (SELECT 1 FROM poll_responses pr, poll_answers pa, polls p WHERE p.id = pa.poll_id AND pr.answer_id = pa.id AND p.thread_id = (SELECT id FROM threads WHERE slug = $1) AND pr.user_id = $2)';
    params = [slug, userId];
  }
  else {
    var q = 'SELECT EXISTS (SELECT 1 FROM poll_responses pr, poll_answers pa, polls p WHERE p.id = pa.poll_id AND pr.answer_id = pa.id AND p.thread_id = $1 AND pr.user_id = $2)';
    threadId = helper.deslugify(threadId);
    params = [threadId, userId]
  }
  return db.sqlQuery(q, params)
  .then(function(rows) { return rows[0].exists; });
};
