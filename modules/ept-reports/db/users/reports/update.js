var path = require('path');
var Promise = require('bluebird');
var dbc = require(path.normalize(__dirname + '/../../db'));
var db = dbc.db;
var helper = dbc.helper;
var using = Promise.using;

module.exports = function(userReport) {
  userReport = helper.deslugify(userReport);
  return using(db.createTransaction(), function(client) {
    var q = 'SELECT ru.id, rs.status, ru.status_id, ru.reporter_user_id, ru.reporter_reason, ru.reviewer_user_id, ru.offender_user_id, ru.created_at, ru.updated_at FROM administration.reports_users ru JOIN administration.reports_statuses rs ON(ru.status_id = rs.id) WHERE ru.id = $1';
    var params = [userReport.id];
    var existingReport;
    return client.queryAsync(q, params)
    .then(function(results) { // check that report exists and return existing report with string status
      var rows = results.rows;
      if (rows.length) { return rows[0]; }
      else { return Promise.reject(); }
    })
    .then(function(dbUserReport) { // lookup status id by passed in status string (e.g "Reviewed" returns 2)
      existingReport = dbUserReport;
      q = 'SELECT id FROM administration.reports_statuses WHERE status = $1';
      params = [userReport.status];
      return client.queryAsync(q, params);
    })
    .then(function(results) { // extract statusId from row and return
      var rows = results.rows;
      if (rows.length) { return rows[0].id; }
      else { return Promise.reject(); }
    })
    .then(function(statusId) { // update report with new status_id, reviewer_user_id, and updated_at
      var newStatusId = statusId || existingReport.status_id;
      var newReviewerUserId = userReport.reviewer_user_id || existingReport.reviewer_user_id;
      q = 'UPDATE administration.reports_users SET status_id = $1, reviewer_user_id = $2, updated_at = now() WHERE id = $3 RETURNING updated_at';
      params = [newStatusId, newReviewerUserId, userReport.id];
      return client.queryAsync(q, params);
    })
    .then(function(results) { // extract updated_at from row and return
      var rows = results.rows;
      if (rows.length) { return rows[0].updated_at; }
      else { return Promise.reject(); }
    })
    .then(function(updatedAt) { // return updated report
      existingReport.updated_at = updatedAt;
      existingReport.status = userReport.status || existingReport.status;
      existingReport.reviewer_user_id = userReport.reviewer_user_id || existingReport.reviewer_user_id;
      delete existingReport.status_id; // only return status string
      return existingReport;
    });
  })
  .then(helper.slugify);
};
