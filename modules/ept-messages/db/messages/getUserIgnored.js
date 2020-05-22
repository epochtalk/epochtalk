var path = require('path');
var dbc = require(path.normalize(__dirname + '/../db'));
var helper = dbc.helper;
var db = dbc.db;

module.exports = function(authedUserId, receiverId) {
  authedUserId = helper.deslugify(authedUserId);
  receiverId = helper.deslugify(receiverId);
  // Check if sender is ignoring receiver
  var q = 'SELECT ignored_user_id, (SELECT username FROM users WHERE id = $2) as receiver_username, (CASE WHEN (user_id = $1 AND ignored_user_id = $2) THEN \'TRUE\'::boolean WHEN (user_id = $2 AND ignored_user_id = $1) THEN \'FALSE\'::boolean END) as ignored_by_authed FROM messages.ignored LEFT JOIN users u ON u.id = user_id WHERE (user_id = $1 AND ignored_user_id = $2) OR (user_id = $2 AND ignored_user_id = $1)';
  return db.scalar(q, [authedUserId, receiverId])
  .then(function(data) {
    if (data) {
      return {
        ignored: true,
        ignored_by_authed: data.ignored_by_authed,
        receiver_username: data.receiver_username,
      };
    }
    else { return { ignored: false }; }
  });
};

