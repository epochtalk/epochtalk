var path = require('path');
var Promise = require('bluebird');
var dbc = require(path.normalize(__dirname + '/../db'));
var using = Promise.using;
var helper = dbc.helper;
var db = dbc.db;
var errors = dbc.errors;
var DeletionError = errors.DeletionError;

module.exports = function(id, userId) {
  id = helper.deslugify(id);
  userId = helper.deslugify(userId);
  var conversationId = '';
  var result = { id: id };
  var deletedBy;
  return using(db.createTransaction(), function(client) {
    // Check if message exists
    var q = 'SELECT conversation_id, deleted_by_user_ids from messages.private_messages WHERE id = $1 FOR UPDATE';
    return client.query(q, [id])
    .then(function(results) {
      if (results.rows.length < 1) { throw new DeletionError('Message Does Not Exist'); }
      else {
        conversationId = results.rows[0].conversation_id;
        deletedBy = results.rows[0].deleted_by_user_ids || [];
      }
    })
    // delete the private message
    .then(function() {
      q = 'UPDATE messages.private_messages SET deleted_by_user_ids = array_append(deleted_by_user_ids, $1) WHERE id = $2 RETURNING sender_id, receiver_ids';
      return client.query(q, [userId, id]);
    })
    // clean up conversation if no more messages
    .then(function(results) {
      var row = results.rows[0];
      result.sender_id = row.sender_id;
      result.receiver_ids = row.receiver_ids;
      q = 'SELECT id FROM messages.private_messages WHERE $1 != ALL(deleted_by_user_ids) AND conversation_id = $2';
      return client.query(q, [userId, conversationId])
      .then(function(results) {
        if (results.rows.length < 1) {
          q = 'UPDATE messages.private_conversations SET deleted_by_user_ids = array_append(deleted_by_user_ids, $1) WHERE id = $2';
          client.query(q, [userId, conversationId]);
        }
      });
    })
    .then(function() { return result; });
  })
  .then(helper.slugify);
};
