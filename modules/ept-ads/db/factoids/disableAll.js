var path = require('path');
var dbc = require(path.normalize(__dirname + '/../db'));
var db = dbc.db;

module.exports = function() {
  var q = `UPDATE factoids SET enabled = false;`;
  return db.sqlQuery(q)
  .then(function() { return; });
};
