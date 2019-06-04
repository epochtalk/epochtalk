var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(pollId) {
  pollId = helper.deslugify(pollId);

  var q = 'SELECT change_vote FROM polls WHERE id = $1';
  return db.sqlQuery(q, [pollId])
  .then(function(rows) {
    var retval = false;
    if (rows.length > 0) { retval = rows[0].change_vote; }
    return retval;
  });
};
