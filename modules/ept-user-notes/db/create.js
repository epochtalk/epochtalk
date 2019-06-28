var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(opts) {
  opts = helper.deslugify(opts);
  var q = 'INSERT INTO user_notes(user_id, author_id, note, created_at, updated_at) VALUES($1, $2, $3, now(), now()) RETURNING id, user_id, author_id, note, created_at, updated_at';
  var params = [ opts.user_id, opts.author_id, opts.note ];
  return db.scalar(q, params)
  .then(helper.slugify);
};
