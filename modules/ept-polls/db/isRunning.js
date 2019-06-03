var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(pollId) {
  pollId = helper.deslugify(pollId);

  var q = 'SELECT expiration FROM polls WHERE id = $1';
  return db.sqlQuery(q, [pollId])
  .then(function(rows) {
    var value = false;
    if (rows.length > 0 && !rows[0].expiration) { value = true; }
    else if (rows.length > 0 && rows[0].expiration && rows[0].expiration > Date.now()) { value = true; }
    return value;
  });
};
