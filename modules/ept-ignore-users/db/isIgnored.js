var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(userId, userIds) {
  userId = helper.deslugify(userId);
  userIds = userIds.map(function(input) { return helper.deslugify(input); });

  var q = `
  SELECT ignored_user_id
  FROM users.ignored
  WHERE user_id = $1
  AND ignored_user_id = ANY($2::uuid[]);
  `;
  return db.sqlQuery(q, [userId, userIds])
  .then(helper.slugify);
};
