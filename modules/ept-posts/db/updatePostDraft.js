var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;
var errors = dbc.errors;
var NotFoundError = errors.NotFoundError;

module.exports = function(userId, draft) {
  userId = helper.deslugify(userId);
  var q = 'INSERT INTO posts.user_drafts (user_id, draft, updated_at) VALUES ($1, $2, now()) ON CONFLICT (user_id) DO UPDATE SET draft = $2, updated_at = now() RETURNING *';
  return db.scalar(q, [userId, draft])
  .then(function(data) {
    return data;
  })
  .then(helper.slugify);
};
