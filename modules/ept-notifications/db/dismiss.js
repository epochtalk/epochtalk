var _ = require('lodash');
var path = require('path');
var dbc = require(path.join(__dirname, 'db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(options) {
  options = helper.deslugify(options);
  var q, params;
  var receiverId = _.get(options, 'receiver_id');
  var type =  _.get(options, 'type');
  var id =  _.get(options, 'id');

  // Dismiss specific notification
  if (id) {
    q = 'UPDATE notifications SET viewed = TRUE WHERE receiver_id = $1 AND type = $2 AND id = $3 AND viewed = FALSE';
    params = [receiverId, type, id];
  }
  // Dimiss all notifications
  else {
    q = 'UPDATE notifications SET viewed = TRUE WHERE receiver_id = $1 AND type = $2 AND viewed = FALSE';
    params = [receiverId, type];
  }

  return db.sqlQuery(q, params)
  .then(function() { return; });
};
