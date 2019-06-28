var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;

module.exports = function() {
  var q = 'SELECT image_url FROM image_expirations WHERE expiration < now()';
  return db.sqlQuery(q);
};
