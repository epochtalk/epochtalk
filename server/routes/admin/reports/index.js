var path = require('path');
var reports = require(path.normalize(__dirname + '/config'));

module.exports = [
  { method: 'POST', path: '/reports/usernotes', config: reports.createUserReportNote },
  { method: 'POST', path: '/reports/postnotes', config: reports.createPostReportNote },
  { method: 'PUT', path: '/reports/users', config: reports.updateUserReport },
  { method: 'PUT', path: '/reports/posts', config: reports.updatePostReport },
  { method: 'PUT', path: '/reports/usernotes', config: reports.updateUserReportNote },
  { method: 'PUT', path: '/reports/postnotes', config: reports.updatePostReportNote },
  { method: 'GET', path: '/reports/users', config: reports.pageUserReports },
  { method: 'GET', path: '/reports/posts', config: reports.pagePostReports },
  { method: 'GET', path: '/reports/usernotes/{report_id}', config: reports.pageUserReportsNotes },
  { method: 'GET', path: '/reports/postnotes/{report_id}', config: reports.pagePostReportsNotes }
];
