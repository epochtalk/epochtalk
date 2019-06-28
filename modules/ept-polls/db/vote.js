var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;
var Promise = require('bluebird');

module.exports = function(answerIds, userId) {
  userId = helper.deslugify(userId);
  answerIds = answerIds.map(function(answerId) { return helper.deslugify(answerId); });

  return Promise.each(answerIds, function(answerId) {
    var q = 'INSERT INTO poll_responses (answer_id, user_id) VALUES ($1, $2)';
    return db.sqlQuery(q, [answerId, userId]);
  });
};
