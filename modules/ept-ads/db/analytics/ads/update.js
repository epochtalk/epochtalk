var path = require('path');
var dbc = require(path.normalize(__dirname + '/../../db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(adId, userId, userIp) {
  adId = helper.deslugify(adId);
  userId = helper.deslugify(userId);

  // update total_impressions
  var q = `
  UPDATE ads.analytics
  SET total_impressions = total_impressions + 1
  WHERE ad_id = $1;
  `;
  return db.sqlQuery(q, [adId])
  // update total_authed_impressions
  .then(function() {
    if (userId) {
      var q = `
      UPDATE ads.analytics
      SET total_authed_impressions = total_authed_impressions + 1
      WHERE ad_id = $1;
      `;
      return db.sqlQuery(q, [adId]);
    }
  })
  // update total_unique_ip_impressions
  .then(function() {
    if (userIp) {
      var q = `
      INSERT INTO ads.unique_ip
      (ad_id, unique_ip)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING;
      `;
      return db.sqlQuery(q, [adId, userIp]);
    }
  })
  // update total_unique_authed_users_impressions
  .then(function() {
    if (userId) {
      var q = `
      INSERT INTO ads.authed_users
      (ad_id, user_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING;
      `;
      return db.sqlQuery(q, [adId, userId]);
    }
  });
};
