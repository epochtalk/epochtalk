var _ = require('lodash');
var path = require('path');
var dbc = require(path.join(__dirname, 'db'));
var db = dbc.db;
var helper = dbc.helper;

// get the latest notifications for a user
module.exports = function(notification) {
  var receiver_id = helper.deslugify(user_id);

  var query = 'SELECT * FROM notifications WHERE receiver_id = $1 AND type = $2 AND viewed = FALSE ORDER BY created_at DESC LIMIT $3 OFFSET $4';

  var type = _.get(opts, 'type');
  var limit = _.get(opts, 'limit', 15);
  var page = _.get(opts, 'page', 1);
  var offset = (page * limit) - limit;

  var params = [receiver_id, type, limit, offset];
  return db.sqlQuery(query, params)
  .then(helper.slugify);
};
