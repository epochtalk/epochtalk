var path = require('path');
var Promise = require('bluebird');
var dbc = require(path.normalize(__dirname + '/../../db'));
var db = dbc.db;
var helper = dbc.helper;
var using = Promise.using;

module.exports = function(postReport) {
  postReport = helper.deslugify(postReport);
  return using(db.createTransaction(), function(client) {
    var q = 'SELECT rp.id, rs.status, rp.status_id, rp.reporter_user_id, rp.reporter_reason, rp.reviewer_user_id, rp.offender_post_id, rp.created_at, rp.updated_at FROM administration.reports_posts rp JOIN administration.reports_statuses rs ON(rp.status_id = rs.id) WHERE rp.id = $1';
    var params = [postReport.id];
    var existingReport;
    return client.queryAsync(q, params)
    .then(function(results) { // check that report exists and return existing report with string status
      var rows = results.rows;
      if (rows.length) { return rows[0]; }
      else { return Promise.reject(); }
    })
    .then(function(dbPostReport) { // lookup status id by passed in status string (e.g "Reviewed" returns 2)
      existingReport = dbPostReport;
      q = 'SELECT id FROM administration.reports_statuses WHERE status = $1';
      params = [postReport.status];
      return client.queryAsync(q, params);
    })
    .then(function(results) { // extract statusId from row and return
      var rows = results.rows;
      if (rows.length) { return rows[0].id; }
      else { return Promise.reject(); }
    })
    .then(function(statusId) { // update report with new status_id, reviewer_user_id, and updated_at
      var newStatusId = statusId || existingReport.status_id;
      var newReviewerUserId = postReport.reviewer_user_id || existingReport.reviewer_user_id;
      q = 'UPDATE administration.reports_posts SET status_id = $1, reviewer_user_id = $2, updated_at = now() WHERE id = $3 RETURNING updated_at';
      params = [newStatusId, newReviewerUserId, postReport.id];
      return client.queryAsync(q, params);
    })
    .then(function(results) { // extract updated_at from row and return
      var rows = results.rows;
      if (rows.length) { return rows[0].updated_at; }
      else { return Promise.reject(); }
    })
    .then(function(updatedAt) { // return updated report
      existingReport.updated_at = updatedAt;
      existingReport.status = postReport.status || existingReport.status;
      existingReport.reviewer_user_id = postReport.reviewer_user_id || existingReport.reviewer_user_id;
      delete existingReport.status_id; // only return status string
      return existingReport;
    });
  })
  .then(helper.slugify);
};
