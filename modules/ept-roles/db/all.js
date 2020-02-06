var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function() {
  var q = 'SELECT id, name, description, lookup, priority, highlight_color, permissions AS base_permissions, custom_permissions AS permissions FROM roles ORDER BY priority';
  return db.sqlQuery(q)
  .then(helper.slugify);
};
