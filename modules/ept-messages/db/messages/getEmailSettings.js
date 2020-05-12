var path = require('path');
var dbc = require(path.normalize(__dirname + '/../db'));
var helper = dbc.helper;
var db = dbc.db;

module.exports = function(userId) {
  userId = helper.deslugify(userId);
  var q = 'SELECT email_messages FROM users.preferences WHERE user_id = $1';
  var params = [ userId ];
  return db.scalar(q, params)
  .then(function(data) {
    if (data === null) { return { email_messages: true }; }
    else { return data; }
  });
};
