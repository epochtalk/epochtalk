var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;

// returns object of public configurations
module.exports = function() {
  var q = 'SELECT config->>\'website\' as website FROM configurations WHERE name = \'default\'';
  return db.scalar(q)
  .then(function(queryResults) {
    return queryResults.website;
  });
};
