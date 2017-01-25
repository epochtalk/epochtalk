var path = require('path');
var Promise = require('bluebird');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;
var using = Promise.using;

module.exports = function(userId) {
  userId = helper.deslugify(userId);
  return using(db.createTransaction(), function(client) {
    var q = 'UPDATE users SET deleted = False WHERE id = $1';
    return client.queryAsync(q, [userId]);
  });
};
