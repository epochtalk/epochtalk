var path = require('path');
var dbc = require(path.normalize(__dirname + '/../../db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(round) {
  var q = `
  SELECT
    aa.total_impressions,
    aa.total_authed_impressions,
    aa.total_unique_ip_impressions,
    aa.total_unique_authed_users_impressions
  FROM ads.analytics aa
  LEFT JOIN ads a ON a.id = aa.ad_id
  WHERE a.round = $1;
  `;
  return db.sqlQuery(q, [round]);
};
