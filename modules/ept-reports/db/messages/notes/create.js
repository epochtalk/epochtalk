var path = require('path');
var Promise = require('bluebird');
var dbc = require(path.normalize(__dirname + '/../../db'));
var db = dbc.db;
var helper = dbc.helper;
var using = Promise.using;

module.exports = function(reportNote) {
  reportNote = helper.deslugify(reportNote);
  return using(db.createTransaction(), function(client) {
    var q = 'INSERT INTO administration.reports_messages_notes(report_id, user_id, note, created_at, updated_at) VALUES($1, $2, $3, now(), now()) RETURNING id, created_at, updated_at';
    var params = [reportNote.report_id, reportNote.user_id, reportNote.note];
    return client.query(q, params)
    .then(function(results) { // return created report note details
      var rows = results.rows;
      if (rows.length) { return rows[0]; }
      else { return Promise.reject(); }
    })
    .then(function(reportDetails) { // append id and return created note
      reportNote.id = reportDetails.id;
      reportNote.created_at = reportDetails.created_at;
      reportNote.updated_at = reportDetails.updated_at;
      return reportNote;
    })
    .then(function() {
      q = 'SELECT u.username, p.avatar FROM users u JOIN users.profiles p ON (p.user_id = u.id) WHERE u.id = $1';
      params = [reportNote.user_id];
      return client.query(q, params);
    })
    .then(function(results) { // return userInfo
      var rows = results.rows;
      if (rows.length) { return rows[0]; }
      else { return Promise.reject(); }
    })
    .then(function(userInfo) {
      reportNote.username = userInfo.username;
      reportNote.avatar = userInfo.avatar;
      return reportNote;
    });
  })
  .then(helper.slugify);
};
