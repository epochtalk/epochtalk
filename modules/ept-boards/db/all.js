var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function() {
  var q = `SELECT
    id,
    name,
    description,
    viewable_by,
    postable_by,
    right_to_left,
    (meta ->> 'disable_post_edit')::int as disable_post_edit,
    created_at,
    updated_at,
    imported_at
    FROM boards`;
  return db.sqlQuery(q)
  .then(helper.slugify);
};
