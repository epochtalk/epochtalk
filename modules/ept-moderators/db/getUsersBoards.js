var path = require('path');
var Promise = require('bluebird');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(userId) {
  userId = helper.deslugify(userId);
  var q = 'SELECT board_id FROM board_moderators WHERE user_id = $1';
  return db.sqlQuery(q, [userId])
  .then(helper.slugify);
};
