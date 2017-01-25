var path = require('path');
var dbc = require(path.normalize(__dirname + '/../db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(roundNumber) {
  var q = `
  SELECT round
  FROM ads.rounds
  WHERE round < $1
  ORDER BY rounds DESC
  LIMIT 1
  `;
  return db.sqlQuery(q, [roundNumber])
  .then(function(rows) {
    if (rows.length > 0) { return rows[0].round; }
    else { return; }
  });
};
