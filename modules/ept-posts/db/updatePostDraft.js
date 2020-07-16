var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;
var errors = dbc.errors;
var NotFoundError = errors.NotFoundError;

module.exports = function(userId, draft) {
  userId = helper.deslugify(userId);
  var q = 'WITH upsert AS (UPDATE posts.user_drafts SET draft = $2 WHERE user_id = $1 AND updated_at = now() RETURNING *) INSERT INTO posts.user_drafts (user_id, draft, updated_at) SELECT $1, $2, $3 WHERE NOT EXISTS (SELECT * FROM upsert)';
  return db.scalar(q, [userId, draft])
  .then(helper.slugify);
};
