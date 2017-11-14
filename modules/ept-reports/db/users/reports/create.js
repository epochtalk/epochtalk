var path = require('path');
var Promise = require('bluebird');
var dbc = require(path.normalize(__dirname + '/../../db'));
var db = dbc.db;
var helper = dbc.helper;
var using = Promise.using;

module.exports = function(userReport) {
  userReport = helper.deslugify(userReport);
  return using(db.createTransaction(), function(client) {
    var q = 'INSERT INTO administration.reports_users(reporter_user_id, reporter_reason, offender_user_id, created_at, updated_at) VALUES($1, $2, $3, now(), now()) RETURNING id';
    var params = [userReport.reporter_user_id, userReport.reporter_reason, userReport.offender_user_id];
    return client.query(q, params)
    .then(function(results) { // return created report id
      var rows = results.rows;
      if (rows.length) { return rows[0].id; }
      else { return Promise.reject(); }
    })
    .then(function(reportId) { // Lookup the created report and return it
      q = 'SELECT ru.id, ru.status, ru.reporter_user_id, ru.reporter_reason, ru.reviewer_user_id, ru.offender_user_id, ru.created_at, ru.updated_at FROM administration.reports_users ru WHERE ru.id = $1';
      params = [reportId];
      return client.query(q, params);
    })
    .then(function(results) { // return created row
      var rows = results.rows;
      if(rows.length) { return rows[0]; }
      else { return Promise.reject(); }
    });
  })
  .then(helper.slugify);
};
