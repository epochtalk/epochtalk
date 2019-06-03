var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(id) {
  id = helper.deslugify(id);
  var q = 'DELETE FROM user_notes WHERE id = $1 RETURNING id, user_id, author_id, note, created_at, updated_at';
  return db.scalar(q, [ id ])
  .then(helper.slugify);
};
