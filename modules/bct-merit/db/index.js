var path = require('path');
var Promise = require('bluebird');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var using = Promise.using;

function recalculateMerit(userId) {
  var queryMerit = 'SELECT SUM(amount) AS merit FROM merit_ledger WHERE to_user_id = $1';
  var updateMerit = 'UPDATE merit_users SET merit = $1 WHERE user_id = $2';
  var merit = 0;

  return using(db.createTransaction(), function(client) {
    return client.query(queryMerit, [userId])
    .then(function(results) {
      if (results.rows.length) {
        merit = results.rows[0].merit;
        return client.query(updateMerit, [merit, userId])
        .then(function() { return merit; });
      }
      else { return merit; }
    });
  });
}
module.exports = {};
