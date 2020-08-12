var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(slug) {
  var q = 'SELECT t.board_id, (SELECT content ->> \'title\' as title FROM posts WHERE thread_id = t.id ORDER BY created_at LIMIT 1) as title FROM threads t WHERE t.slug = $1';
  return db.sqlQuery(q, [slug])
  .then(function(rows) {
    if (rows.length > 0) { return rows[0]; }
    else { return {}; }
  })
  .then(helper.slugify);
};
