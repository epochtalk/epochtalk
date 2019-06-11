var _ = require('lodash');
var path = require('path');
var dbc = require(path.join(__dirname, 'db'));
var db = dbc.db;
var helper = dbc.helper;
var Promise = require('bluebird');

module.exports = function(user_id, opts) {
  var max = _.get(opts, 'max', 10);
  var postProcessCount = function(rows) {
    // if the total rows returned exceeds the max
    // return string value '{max}+'
    if (rows.length > max) {
      return max + '+';
    }
    // otherwise, return the count
    else {
      return rows.length;
    }
  };
  var receiver_id = helper.deslugify(user_id);
  var getNotificationsCount = function(type) {
    // count notifications received by user
    var q = 'SELECT * FROM notifications WHERE receiver_id = $1 AND type = $2 AND viewed = FALSE LIMIT $3';
    return db.sqlQuery(q, [receiver_id, type, max + 1])
    .then(postProcessCount);
  };
  var getOtherNotificationsCount = function(otherThanTypes) {
    // count notifications received by user
    var q = 'SELECT * FROM notifications WHERE receiver_id = $1 AND type != ANY ($2) AND viewed = FALSE LIMIT $3';
    return db.sqlQuery(q, [receiver_id, otherThanTypes, max + 1])
    .then(postProcessCount);
  };

  return Promise.join(getNotificationsCount('message'), getNotificationsCount('mention'), getOtherNotificationsCount(['message', 'mention']), function(messageNotificationsCount, mentionNotificationsCount, otherNotificationsCount) {
    return {
      message: messageNotificationsCount,
      mention: mentionNotificationsCount,
      other: otherNotificationsCount
    };
  });
};
