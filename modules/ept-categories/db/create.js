var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(category) {
  var q = 'INSERT INTO categories(name, viewable_by) VALUES($1, $2) RETURNING id';
  var params = [category.name, category.viewable_by];
  return db.sqlQuery(q, params)
  .then(function(rows) {
    return {
      id: rows[0].id,
      name: category.name,
      viewable_by: category.viewable_by
    };
  })
  .then(helper.slugify);
};
