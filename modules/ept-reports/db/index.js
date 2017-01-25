var path = require('path');

module.exports = {
  // User Reports
  createUserReport: require(path.normalize(__dirname + '/users/reports/create')),
  pageUserReports: require(path.normalize(__dirname + '/users/reports/page')),
  userReportsCount: require(path.normalize(__dirname + '/users/reports/count')),
  updateUserReport: require(path.normalize(__dirname + '/users/reports/update')),
  // User Report Notes
  createUserReportNote: require(path.normalize(__dirname + '/users/notes/create')),
  findUserReportNote: require(path.normalize(__dirname + '/users/notes/find')),
  pageUserReportsNotes: require(path.normalize(__dirname + '/users/notes/page')),
  userReportsNotesCount: require(path.normalize(__dirname + '/users/notes/count')),
  updateUserReportNote: require(path.normalize(__dirname + '/users/notes/update')),
  // Post Reports
  createPostReport: require(path.normalize(__dirname + '/posts/reports/create')),
  pagePostReports: require(path.normalize(__dirname + '/posts/reports/page')),
  postReportsCount: require(path.normalize(__dirname + '/posts/reports/count')),
  updatePostReport: require(path.normalize(__dirname + '/posts/reports/update')),
  // Post Report Notes
  createPostReportNote: require(path.normalize(__dirname + '/posts/notes/create')),
  findPostReportNote: require(path.normalize(__dirname + '/posts/notes/find')),
  pagePostReportsNotes: require(path.normalize(__dirname + '/posts/notes/page')),
  postReportsNotesCount: require(path.normalize(__dirname + '/posts/notes/count')),
  updatePostReportNote: require(path.normalize(__dirname + '/posts/notes/update')),
  // Message Reports
  createMessageReport: require(path.normalize(__dirname + '/messages/reports/create')),
  pageMessageReports: require(path.normalize(__dirname + '/messages/reports/page')),
  messageReportsCount: require(path.normalize(__dirname + '/messages/reports/count')),
  updateMessageReport: require(path.normalize(__dirname + '/messages/reports/update')),
  // Message Report Notes
  createMessageReportNote: require(path.normalize(__dirname + '/messages/notes/create')),
  findMessageReportNote: require(path.normalize(__dirname + '/messages/notes/find')),
  pageMessageReportsNotes: require(path.normalize(__dirname + '/messages/notes/page')),
  messageReportsNotesCount: require(path.normalize(__dirname + '/messages/notes/count')),
  updateMessageReportNote: require(path.normalize(__dirname + '/messages/notes/update'))
};
