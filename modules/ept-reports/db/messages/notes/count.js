var path = require('path');
var Promise = require('bluebird');
var dbc = require(path.normalize(__dirname + '/../../db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(reportId) {
  reportId = helper.deslugify(reportId);
  var q = 'SELECT count(id) FROM administration.reports_messages_notes WHERE report_id = $1';
  var params = [reportId];
  return db.sqlQuery(q, params)
  .then(function(rows) {
    if (rows.length) { return Number(rows[0].count); }
  });
};
