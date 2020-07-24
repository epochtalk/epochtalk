var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(userId) {
  userId = helper.deslugify(userId);
  var q = 'SELECT p.* FROM posts.user_drafts p WHERE p.user_id = $1';
  return db.scalar(q, [userId])
  .then(function(draft) {
    return draft || { user_id: userId, draft: null, updated_at: null };
  })
  .then(helper.slugify);
};
