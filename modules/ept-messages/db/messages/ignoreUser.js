var path = require('path');
var dbc = require(path.normalize(__dirname + '/../db'));
var helper = dbc.helper;
var db = dbc.db;

module.exports = function(userId, ignoredUserId) {
  userId = helper.deslugify(userId);
  ignoredUserId = helper.deslugify(ignoredUserId);
  var q = 'INSERT INTO messages.ignored(user_id, ignored_user_id, created_at) VALUES($1, $2, now())';
  return db.sqlQuery(q, [userId, ignoredUserId])
  .then(function() {
    return { success: true };
  });
};
