var path = require('path');
var Promise = require('bluebird');
var dbc = require(path.normalize(__dirname + '/../../db'));
var db = dbc.db;
var helper = dbc.helper;
var using = Promise.using;

module.exports = function(messageReport) {
  messageReport = helper.deslugify(messageReport);
  return using(db.createTransaction(), function(client) {
    var q = 'SELECT rm.id, rm.status, rm.reporter_user_id, rm.reporter_reason, rm.reviewer_user_id, rm.offender_message_id, rm.created_at, rm.updated_at FROM administration.reports_messages rm WHERE rm.id = $1';
    var params = [messageReport.id];
    var existingReport;
    return client.query(q, params)
    .then(function(results) { // check that report exists and return existing report with string status
      var rows = results.rows;
      if (rows.length) { return rows[0]; }
      else { return Promise.reject(); }
    })
    .then(function(dbMessageReport) {
      existingReport = dbMessageReport;
      var newReviewerUserId = messageReport.reviewer_user_id || existingReport.reviewer_user_id;
      q = 'UPDATE administration.reports_messages SET status = $1, reviewer_user_id = $2, updated_at = now() WHERE id = $3 RETURNING updated_at';
      params = [messageReport.status, newReviewerUserId, messageReport.id];
      return client.query(q, params);
    })
    .then(function(results) { // extract updated_at from row and return
      var rows = results.rows;
      if (rows.length) { return rows[0].updated_at; }
      else { return Promise.reject(); }
    })
    .then(function(updatedAt) { // return updated report
      existingReport.updated_at = updatedAt;
      existingReport.status = messageReport.status || existingReport.status;
      existingReport.reviewer_user_id = messageReport.reviewer_user_id || existingReport.reviewer_user_id;
      return existingReport;
    });
  })
  .then(helper.slugify);
};
