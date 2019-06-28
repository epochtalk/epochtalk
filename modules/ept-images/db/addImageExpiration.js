var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;

module.exports = function(url, expiration) {
  var q = 'INSERT INTO image_expirations (image_url, expiration) VALUES ($1, $2)';
  return db.sqlQuery(q, [url, expiration]);
};
