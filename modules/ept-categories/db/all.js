var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function() {
  var q = 'SELECT id, name, view_order, viewable_by, imported_at from categories';
  return db.sqlQuery(q)
  .then(helper.slugify);
};
