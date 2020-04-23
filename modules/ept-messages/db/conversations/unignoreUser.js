var path = require('path');
var dbc = require(path.normalize(__dirname + '/../db'));
var helper = dbc.helper;
var db = dbc.db;

module.exports = function(userId, ignoredUserId) {
  userId = helper.deslugify(userId);
  ignoredUserId = helper.deslugify(ignoredUserId);
  var q, params;
  if (ignoredUserId) { // Delete specific ignored user
    q = 'DELETE FROM messages.ignored WHERE user_id = $1 AND ignored_user_id = $2';
    params = [userId, ignoredUserId];
  }
  else { // Delete all ignored users
    q = 'DELETE FROM messages.ignored WHERE user_id = $1';
    params = [userId];
  }
  return db.sqlQuery(q, params)
  .then(function() {
    return { success: true };
  });
};
