var path = require('path');
var Promise = require('bluebird');
var dbc = require(path.normalize(__dirname + '/../db'));
var using = Promise.using;
var helper = dbc.helper;
var db = dbc.db;
var errors = dbc.errors;
var CreationError = errors.CreationError;

module.exports = function(message) {
  message = helper.deslugify(message);
  if (message.content.body === message.content.body_html) {
    delete message.content.body_html
  }
  var q = 'INSERT INTO messages.private_messages(conversation_id, sender_id, receiver_ids, content, created_at) VALUES ($1, $2, $3, $4, now()) RETURNING id, created_at';
  var params = [message.conversation_id, message.sender_id, message.receiver_ids, message.content];
  return using(db.createTransaction(), function(client) {
    return client.query(q, params)
    .then(function(results) {
      if (results.rows.length > 0) {
        message.id = results.rows[0].id;
        message.created_at = results.rows[0].created_at;
        message.viewed = false;
        if (!message.content.body_html) { message.content.body_html = message.content.body; }
      }
      else { throw new CreationError('Private Message Could Not Be Saved'); }
    })
    .then(function() {
      q = 'UPDATE messages.private_conversations SET deleted_by_user_ids = $1 WHERE id = $2';
      return client.query(q, [[], message.conversation_id]);
    });
  })
  .then(function() { return helper.slugify(message); });
};
