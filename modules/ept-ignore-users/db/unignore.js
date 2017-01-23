var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(userId, ignoreUserId) {
  userId = helper.deslugify(userId);
  ignoreUserId = helper.deslugify(ignoreUserId);
  var q = 'DELETE FROM users.ignored WHERE user_id = $1 AND ignored_user_id = $2';
  return db.sqlQuery(q, [userId, ignoreUserId])
  .then(function() { return; });
};
