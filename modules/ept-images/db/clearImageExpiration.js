var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;

module.exports = function(url) {
  var q = 'DELETE FROM image_expirations WHERE image_url = $1';
  return db.sqlQuery(q, [url]);
};
