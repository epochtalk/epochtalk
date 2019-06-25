var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(userId) {
  userId = helper.deslugify(userId);
  var q = 'SELECT coalesce((SELECT total_activity FROM user_activity WHERE user_id = $1), 0) as activity';
  return db.scalar(q, [userId])
  .then(function(userInfo) { return userInfo.activity; });
};
