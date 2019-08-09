var path = require('path');
var Promise = require('bluebird');
var dbc = require(path.normalize(__dirname + '/../../db'));
var db = dbc.db;
var helper = dbc.helper;
var using = Promise.using;

module.exports = function(messageReport) {
  messageReport = helper.deslugify(messageReport);
  return using(db.createTransaction(), function(client) {
    var q = 'INSERT INTO administration.reports_messages(reporter_user_id, reporter_reason, offender_message_id, created_at, updated_at) VALUES($1, $2, $3, now(), now()) RETURNING id';
    var params = [messageReport.reporter_user_id, messageReport.reporter_reason, messageReport.offender_message_id];
    return client.query(q, params)
    .then(function(results) { // return created report id
      var rows = results.rows;
      if (rows.length) { return rows[0].id; }
    })
    .then(function(reportId) { // Lookup the created report and return it
      q = 'SELECT ru.id, ru.status, ru.reporter_user_id, ru.reporter_reason, ru.reviewer_user_id, ru.offender_message_id, ru.created_at, ru.updated_at FROM administration.reports_messages ru WHERE ru.id = $1';
      params = [reportId];
      return client.query(q, params);
    })
    .then(function(results) { // return created row
      var rows = results.rows;
      if(rows.length) { return rows[0]; }
    });
  })
  .then(helper.slugify);
};
