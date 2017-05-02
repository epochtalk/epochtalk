var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;
var errors = dbc.errors;
var NotFoundError = errors.NotFoundError;

/* returns all values */
module.exports = function(userId) {
  userId = helper.deslugify(userId);
  var q = `
    SELECT last_active
    FROM users.profiles
    WHERE user_id = $1
  `;
  return db.sqlQuery(q, [userId])
  .then(function(rows) {
    if (rows.length > 0) { return rows[0].last_active; }
    else { throw new NotFoundError('User Not Found'); }
  });
};
