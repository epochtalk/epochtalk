var path = require('path');
var dbc = require(path.normalize(__dirname + '/../db'));
var helper = dbc.helper;
var db = dbc.db;

module.exports = function(conversationId, userId) {
  conversationId = helper.deslugify(conversationId);
  userId = helper.deslugify(userId);

  var q = 'SELECT id FROM private_messages WHERE conversation_id = $1 AND (sender_id = $2 OR $2 = ANY(receiver_ids))';
  return db.sqlQuery(q, [conversationId, userId])
  .then(function(rows) { return rows.length > 0; });
};
