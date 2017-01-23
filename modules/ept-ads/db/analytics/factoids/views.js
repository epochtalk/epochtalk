var path = require('path');
var dbc = require(path.normalize(__dirname + '/../../db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(round) {
  var q = `
  SELECT
    total_impressions,
    total_authed_impressions,
    total_unique_ip_impressions,
    total_unique_authed_users_impressions
  FROM factoids.analytics
  WHERE round = $1;
  `;
  return db.sqlQuery(q, [round])
  .then(function(rows) {
    if (rows.length > 0) { return rows[0]; }
    else { return []; }
  });
};
