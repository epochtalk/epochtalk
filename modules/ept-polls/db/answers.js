var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(pollId) {
  pollId = helper.deslugify(pollId);

  var q = 'SELECT * FROM poll_answers WHERE poll_id = $1';
  return db.sqlQuery(q, [pollId]);
};
