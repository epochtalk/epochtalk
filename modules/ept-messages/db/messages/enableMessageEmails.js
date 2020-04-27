var path = require('path');
var dbc = require(path.normalize(__dirname + '/../db'));
var helper = dbc.helper;
var db = dbc.db;

module.exports = function(userId, enabled) {
  userId = helper.deslugify(userId);
  var q = `INSERT INTO users.preferences (user_id, email_mentions)
           VALUES ($1, $2)
           ON CONFLICT (user_id) DO UPDATE SET email_mentions = $2`;
  var params = [ userId, enabled ];
  return db.sqlQuery(q, params)
  .then(function() { return { enabled: enabled }; });
};
