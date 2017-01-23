var path = require('path');
var dbc = require(path.normalize(__dirname + '/../../db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(userId, userIp) {
  // round should always be current round
  userId = helper.deslugify(userId);

  // update total_impressions
  var q = `
  UPDATE factoids.analytics
  SET total_impressions =  total_impressions + 1
  WHERE round = (SELECT round FROM ads.rounds WHERE current = true);
  `;
  return db.sqlQuery(q)
  // update total_authed_impressions
  .then(function() {
    if (userId) {
      var q = `
      UPDATE factoids.analytics
      SET total_authed_impressions = total_authed_impressions + 1
      WHERE round = (SELECT round FROM ads.rounds WHERE current = true);
      `;
      return db.sqlQuery(q);
    }
  })
  // update total_unique_ip_impressions
  .then(function() {
    if (userIp) {
      var q = `
      INSERT INTO factoids.unique_ip
      (round, unique_ip)
      VALUES ((SELECT round FROM ads.rounds WHERE current = true), $1)
      ON CONFLICT DO NOTHING;
      `;
      return db.sqlQuery(q, [userIp]);
    }
  })
  // update total_unique_authed_users_impressions
  .then(function() {
    if (userId) {
      var q = `
      INSERT INTO factoids.authed_users
      (round, user_id)
      VALUES ((SELECT round FROM ads.rounds WHERE current = true), $1)
      ON CONFLICT DO NOTHING;
      `;
      return db.sqlQuery(q, [userId]);
    }
  });
};
