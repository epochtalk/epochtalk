var path = require('path');
var Promise = require('bluebird');
var dbc = require(path.normalize(__dirname + '/../../db'));
var db = dbc.db;
var helper = dbc.helper;
var using = Promise.using;

module.exports = function(postReport) {
  postReport = helper.deslugify(postReport);
  return using(db.createTransaction(), function(client) {
    var q = 'INSERT INTO administration.reports_posts(reporter_user_id, reporter_reason, offender_post_id, created_at, updated_at) VALUES($1, $2, $3, now(), now()) RETURNING id';
    var params = [postReport.reporter_user_id, postReport.reporter_reason, postReport.offender_post_id];
    return client.queryAsync(q, params)
    .then(function(results) { // return created report id
      var rows = results.rows;
      if (rows.length) { return rows[0].id; }
      else { return Promise.reject(); }
    })
    .then(function(reportId) { // Lookup the created report and return it
      q = 'SELECT rp.id, rp.status, rp.reporter_user_id, rp.reporter_reason, rp.reviewer_user_id, rp.offender_post_id, rp.created_at, rp.updated_at FROM administration.reports_posts rp WHERE rp.id = $1';
      params = [reportId];
      return client.queryAsync(q, params);
    })
    .then(function(results) { // return created row
      var rows = results.rows;
      if(rows.length) { return rows[0]; }
      else { return Promise.reject(); }
    });
  })
  .then(helper.slugify);
};
