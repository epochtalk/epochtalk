var path = require('path');
var dbc = require(path.normalize(__dirname + '/../db'));
var helper = dbc.helper;
var db = dbc.db;

module.exports = function(messageSenderId, messageReceiverId) {
  messageReceiverId = helper.deslugify(messageReceiverId);
  messageSenderId = helper.deslugify(messageSenderId);
  // Check if sender is ignoring receiver
  var q = 'SELECT ignored_user_id, u.username as receiver_username, u2.username as sender_username, (CASE WHEN (user_id = $1 AND ignored_user_id = $2) THEN \'TRUE\'::boolean WHEN (user_id = $2 AND ignored_user_id = $1) THEN \'FALSE\'::boolean END) as ignored_by_authed FROM messages.ignored LEFT JOIN users u ON u.id = user_id LEFT JOIN users u2 ON u2.id = ignored_user_id WHERE (user_id = $1 AND ignored_user_id = $2) OR (user_id = $2 AND ignored_user_id = $1)';
  return db.scalar(q, [messageSenderId, messageReceiverId])
  .then(function(data) {
    if (data) {
      return {
        ignored: true,
        ignored_by_authed: data.ignored_by_authed,
        receiver_username: data.receiver_username,
        receiver_user_id: helper.slugify(data.ignored_user_id),
        sender_username: data.sender_username,
        sender_user_id: helper.slugify(messageSenderId)
      };
    }
    else { return { ignored: false }; }
  });
};

