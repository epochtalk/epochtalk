var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(pollId, userId) {
  pollId = helper.deslugify(pollId);
  userId = helper.deslugify(userId);

  // remove any old votes
  var q = 'DELETE FROM poll_responses WHERE answer_id IN (SELECT id FROM poll_answers WHERE poll_id = $1) AND user_id = $2';
  return db.sqlQuery(q, [pollId, userId]);
};
