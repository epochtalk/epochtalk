var path = require('path');
var Promise = require('bluebird');
var dbc = require(path.normalize(__dirname + '/../db'));
var using = Promise.using;
var helper = dbc.helper;
var db = dbc.db;
var errors = dbc.errors;
var DeletionError = errors.DeletionError;

module.exports = function(id) {
  id = helper.deslugify(id);
  var conversationId = '';
  var result = { id: id };
  return using(db.createTransaction(), function(client) {
    // Check if message exists
    var q = 'SELECT conversation_id from private_messages WHERE id = $1 FOR UPDATE';
    return client.queryAsync(q, [id])
    .then(function(results) {
      if (results.rows.length < 1) { throw new DeletionError('Message Does Not Exist'); }
      else { conversationId = results.rows[0].conversation_id; }
    })
    // delete the private message
    .then(function() {
      q = 'DELETE FROM private_messages WHERE id = $1 RETURNING sender_id, receiver_id';
      return client.queryAsync(q, [id]);
    })
    // clean up conversation if no more messages
    .then(function(results) {
      var row = results.rows[0];
      result.sender_id = row.sender_id;
      result.receiver_id = row.receiver_id;
      q = 'SELECT id FROM private_messages WHERE conversation_id = $1';
      return client.queryAsync(q, [conversationId])
      .then(function(results) {
        if (results.rows.length < 1) {
          q = 'DELETE FROM private_conversations WHERE id = $1';
          client.queryAsync(q, [conversationId]);
        }
      });
    })
    .then(function() { return result; });
  })
  .then(helper.slugify);
};
