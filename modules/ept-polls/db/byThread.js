var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(threadId) {
  threadId = helper.deslugify(threadId);

  var q = 'SELECT p.id, p.question, p.locked, p.max_answers, p.expiration, p.change_vote, p.display_mode, ';
  q += '(SELECT json_agg(row_to_json((SELECT x FROM ( ';
  q +=   'SELECT pa.id, pa.answer, ';
  q +=   '(SELECT COUNT(*) ';
  q +=     'FROM poll_responses pr ';
  q +=     'WHERE pr.answer_id = pa.id) as votes';
  q +=   ') x ))) as answers ';
  q +=   'FROM poll_answers pa ';
  q +=   'WHERE pa.poll_id = p.id ';
  q += ') as answers ';
  q += 'FROM polls p ';
  q += 'WHERE p.thread_id = $1';
  return db.sqlQuery(q, [threadId])
  .then(function(rows) {
    if (rows.length > 0) { return rows[0]; }
    else { return; }
  })
  .then(helper.slugify);
};
