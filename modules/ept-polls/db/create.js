var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;
var errors = dbc.errors;
var CreationError = errors.CreationError;
var byThread = require(path.normalize(__dirname + '/byThread'));

module.exports = function(threadId, poll) {
  var slugThreadId = threadId;
  threadId = helper.deslugify(threadId);
  var pollId = '';

  var q = 'INSERT INTO polls (thread_id, question, max_answers, expiration, change_vote, display_mode) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id';
  return db.sqlQuery(q, [threadId, poll.question, poll.max_answers, poll.expiration || null, poll.change_vote, poll.display_mode])
  .then(function(rows) {
    if (rows.length > 0) { return rows[0]; }
    else { throw new CreationError('ERROR creating poll'); }
  })
  .then(function(dbPoll) {
    pollId = dbPoll.id;
    var answerQ = 'INSERT INTO poll_answers (poll_id, answer) VALUES ';
    var params = [dbPoll.id];
    var answerCount = 2;
    var first = true;

    poll.answers.forEach(function(answer) {
      if (first) {
        answerQ += '($1, $' + answerCount + ')';
        first = false;
      }
      else { answerQ += ', ($1, $' + answerCount + ')'; }
      answerCount++;
      params.push(answer);
    });

    return db.sqlQuery(answerQ, params);
  })
  .then(function() { return byThread(slugThreadId); });
};
