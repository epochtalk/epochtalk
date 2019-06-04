var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(opts) {
  opts = helper.deslugify(opts);
  var q = 'UPDATE user_notes SET note = $1, updated_at = now() WHERE id = $2 RETURNING id, user_id, author_id, note, created_at, updated_at';
  var params = [ opts.note, opts.id ];
  return db.scalar(q, params)
  .then(helper.slugify);
};
