var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

/* returns all values */
module.exports = function(userId) {
  userId = helper.deslugify(userId);
  var q = `
    UPDATE users.profiles
    SET last_active = now()
    WHERE user_id = $1
  `;
  return db.sqlQuery(q, [userId]);
};
