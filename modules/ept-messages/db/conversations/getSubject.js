var path = require('path');
var dbc = require(path.normalize(__dirname + '/../db'));
var helper = dbc.helper;
var db = dbc.db;

module.exports = function(conversationId, userId) {
  conversationId = helper.deslugify(conversationId);
  userId = helper.deslugify(userId);
  var q = 'SELECT content->>\'subject\' as subject FROM messages.private_messages WHERE conversation_id = $1 AND (sender_id = $2 OR $2 = ANY(receiver_ids)) ORDER BY created_at ASC limit 1';
  console.log(q, [conversationId, userId]);
  return db.scalar(q, [conversationId, userId])
  .then(function(data) { return data.subject; });
};
