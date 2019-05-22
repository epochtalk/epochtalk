var _ = require('lodash');
var path = require('path');
var dbc = require(path.join(__dirname, 'db'));
var db = dbc.db;
var errors = dbc.errors;
var CreationError = errors.CreationError;
var helper = dbc.helper;
var Promise = require('bluebird');
var using = Promise.using;

module.exports = function(notification) {
  notification = helper.deslugify(notification);
  var q = 'INSERT INTO notifications(sender_id, receiver_id, type, data, created_at) VALUES ($1, $2, $3, $4, now()) RETURNING id, sender_id, receiver_id, created_at, viewed';
  var params = [_.get(notification, 'sender_id'), _.get(notification, 'receiver_id'), _.get(notification, 'type'), _.get(notification, 'data')];
  return using(db.createTransaction(), function(client) {
    return client.query(q, params)
    .then(function(results) {
      if (results.rows.length > 0) {
        notification = results.rows[0];
      }
      else { throw new CreationError('Notification Could Not Be Saved'); }
    });
  })
  .then(function() { return helper.slugify(notification); });
};
