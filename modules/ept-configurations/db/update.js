var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;

// updates configurations from an object
module.exports = function(config) {
  var query = 'UPDATE configurations SET config = $1 WHERE name = \'default\'';
  return db.sqlQuery(query, [config]);
};
