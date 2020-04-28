var path = require('path');
var dbc = require(path.normalize(__dirname + '/../db'));
var helper = dbc.helper;
var db = dbc.db;

module.exports = function(userId, ignoredUserId) {
  userId = helper.deslugify(userId);
  ignoredUserId = helper.deslugify(ignoredUserId);
  var q = 'SELECT ignored_user_id, u.username FROM messages.ignored LEFT JOIN users u ON u.id = user_id WHERE (user_id = $1 AND ignored_user_id = $2) OR (user_id = $2 AND ignored_user_id = $1)';
  return db.scalar(q, [userId, ignoredUserId])
  .then(function(data) {
    if (data) { return { ignored: true, ignored_username: data.username, ignored_user_id: helper.slugify(data.ignored_user_id) }; }
    else { return { ignored: false }; }
  });
};

