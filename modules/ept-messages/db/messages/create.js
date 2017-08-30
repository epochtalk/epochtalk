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
  var q = 'INSERT INTO private_messages(conversation_id, sender_id, receiver_id, body, created_at) VALUES ($1, $2, $3, $4, now()) RETURNING id, created_at';
  var params = [message.conversation_id, message.sender_id, message.receiver_id, message.body];
  return using(db.createTransaction(), function(client) {
    return client.queryAsync(q, params)
    .then(function(results) {
      if (results.rows.length > 0) {
        message.id = results.rows[0].id;
        message.created_at = results.rows[0].created_at;
        message.viewed = false;
      }
      else { throw new CreationError('Private Message Could Not Be Saved'); }
    });
  })
  .then(function() { return helper.slugify(message); });
};
