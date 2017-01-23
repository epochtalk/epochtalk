var path = require('path');
var dbc = require(path.normalize(__dirname + '/../db'));
var db = dbc.db;

module.exports = function() {
  var round = {};
  var q = `INSERT INTO ads.rounds DEFAULT VALUES RETURNING round;`;
  return db.sqlQuery(q)
  .then(function(rows) {
    if (rows.length > 0) {
      round.round = rows[0].round;
      return round;
    }
    else { throw Error('Could Not Create Round'); }
  })
  // create analytics for factoids
  .then(function() {
    var q = `INSERT INTO factoids.analytics (round) VALUES ($1);`;
    return db.sqlQuery(q, [round.round]);
  })
  .then(function() { return round; });
};
