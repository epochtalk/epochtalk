var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(pollId) {
  pollId = helper.deslugify(pollId);

  var q = 'SELECT max_answers FROM polls WHERE id = $1';
  return db.sqlQuery(q, [pollId])
  .then(function(rows) {
    if (rows.length > 0) { return rows[0].max_answers; }
  });
};
