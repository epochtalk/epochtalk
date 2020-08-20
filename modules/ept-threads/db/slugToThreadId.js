var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;
var errors = dbc.errors;
var NotFoundError = errors.NotFoundError;

module.exports = function(slug) {
  var query = 'SELECT id FROM threads WHERE slug = $1';
  return db.scalar(query, [slug])
  .then(function(row) {
    if (row.id) { return row.id; }
    else { throw new NotFoundError('Thread Not Found'); }
  })
  .then(helper.slugify);
};
