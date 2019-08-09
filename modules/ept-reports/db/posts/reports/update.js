var path = require('path');
var Promise = require('bluebird');
var dbc = require(path.normalize(__dirname + '/../../db'));
var db = dbc.db;
var helper = dbc.helper;
var using = Promise.using;

module.exports = function(postReport) {
  postReport = helper.deslugify(postReport);
  return using(db.createTransaction(), function(client) {
    var q = 'SELECT rp.id, rp.status, rp.reporter_user_id, rp.reporter_reason, rp.reviewer_user_id, rp.offender_post_id, rp.created_at, rp.updated_at FROM administration.reports_posts rp WHERE rp.id = $1';
    var params = [postReport.id];
    var existingReport;
    return client.query(q, params)
    .then(function(results) { // check that report exists and return existing report with string status
      var rows = results.rows;
      if (rows.length) { return rows[0]; }
    })
    .then(function(dbPostReport) {
      existingReport = dbPostReport;
      var newReviewerUserId = postReport.reviewer_user_id || existingReport.reviewer_user_id;
      q = 'UPDATE administration.reports_posts SET status = $1, reviewer_user_id = $2, updated_at = now() WHERE id = $3 RETURNING updated_at';
      params = [postReport.status , newReviewerUserId, postReport.id];
      return client.query(q, params);
    })
    .then(function(results) { // extract updated_at from row and return
      var rows = results.rows;
      if (rows.length) { return rows[0].updated_at; }
    })
    .then(function(updatedAt) { // return updated report
      existingReport.updated_at = updatedAt;
      existingReport.status = postReport.status || existingReport.status;
      existingReport.reviewer_user_id = postReport.reviewer_user_id || existingReport.reviewer_user_id;
      return existingReport;
    });
  })
  .then(helper.slugify);
};
