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
  var result = { id: id };
  return using(db.createTransaction(), function(client) {
    // Check if conversation exists
    var q = 'SELECT id from private_conversations WHERE id = $1 FOR UPDATE';
    return client.queryAsync(q, [id])
    .then(function(results) {
      if (results.rows.length < 1) { throw new DeletionError('Conversation Does Not Exist'); }
      q = 'SELECT sender_id, receiver_ids FROM private_messages WHERE conversation_id = $1 FOR UPDATE';
      return client.queryAsync(q, [id]);
    })
    // append sender and receiver ids to reply
    .then(function(results) {
      if (results.rows.length < 1) { throw new DeletionError('Conversation Does Not Exist'); }
      var row = results.rows[0];
      result.sender_id = row.sender_id;
      result.receiver_ids = row.receiver_ids;
      return;
    })
    // delete the private messages within the conversation
    .then(function() {
      q = 'UPDATE private_messages SET deleted_by_user_ids = array_append(deleted_by_user_ids, $1) WHERE conversation_id = $2';
      return client.queryAsync(q, [userId, id]);
    })
    // delete the private conversation
    .then(function() {
      q = 'UPDATE private_conversations SET deleted_by_user_ids = array_append(deleted_by_user_ids, $1) WHERE id = $2';
      return client.queryAsync(q, [userId, id]);
    })
    .then(function() { return result; });
  })
  .then(helper.slugify);
};
