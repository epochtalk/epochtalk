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
    (meta ->> 'disable_post_edit') as disable_post_edit,
    (meta ->> 'disable_signature')::boolean as disable_signature,
    (meta ->> 'disable_selfmod')::boolean as disable_selfmod,
    created_at,
    updated_at,
    imported_at
    FROM boards`;
  return db.sqlQuery(q)
  .then(helper.slugify);
};
