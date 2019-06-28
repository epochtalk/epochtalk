var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(id) {
  id = helper.deslugify(id);
  var q = 'SELECT user_id, author_id, note, created_at, updated_at FROM user_notes WHERE id = $1';
  return db.scalar(q, [ id ])
  .then(helper.slugify);
};
