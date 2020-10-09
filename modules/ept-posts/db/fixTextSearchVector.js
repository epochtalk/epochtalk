var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(post) {
  var q = `SELECT
    setweight(to_tsvector('simple', COALESCE($1,'')), 'A') ||
    setweight(to_tsvector('simple', COALESCE($2,'')), 'B')
    AS tsv`;
  return db.scalar(q, [ post.title, post.body_original ])
  .then(function(data) {
    q = 'UPDATE posts SET tsv = $1 WHERE id = $2 RETURNING id';
    return db.sqlQuery(q, [ data.tsv, helper.deslugify(post.id) ]);
  })
  .then(helper.slugify);
};
