var path = require('path');
var Promise = require('bluebird');
var dbc = require(path.normalize(__dirname + '/../../db'));
var db = dbc.db;
var helper = dbc.helper;
var using = Promise.using;

module.exports = function(reportNote) {
  reportNote = helper.deslugify(reportNote);
  return using(db.createTransaction(), function(client) {
    var q = 'SELECT n.id, n.report_id, n.user_id, n.note, n.created_at, n.updated_at, u.username, p.avatar FROM administration.reports_users_notes n JOIN users u ON(u.id = user_id) JOIN users.profiles p ON (p.user_id = n.user_id) WHERE n.id = $1';
    var params = [reportNote.id];
    var existingReportNote;
    return client.queryAsync(q, params)
    .then(function(results) { // lookup and return existing reportNote
      var rows = results.rows;
      if (rows.length) { return rows[0]; }
      else { return Promise.reject(); }
    })
    .then(function(dbReportNote) { // update only note content and updated_at timestamp
      existingReportNote = dbReportNote;
      existingReportNote.note = reportNote.note;
      q = 'UPDATE administration.reports_users_notes SET note = $1, updated_at = now() WHERE id = $2 RETURNING updated_at';
      params = [existingReportNote.note, existingReportNote.id];
      return client.queryAsync(q, params);
    })
    .then(function(results) { // extract updated_at from row and return
      var rows = results.rows;
      if (rows.length) { return rows[0].updated_at; }
      else { return Promise.reject(); }
    })
    .then(function(updatedAt) { // return updated report note
      existingReportNote.updated_at = updatedAt;
      return existingReportNote;
    });
  })
  .then(helper.slugify);
};
