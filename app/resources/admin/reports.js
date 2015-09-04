'use strict';
/* jslint node: true */

module.exports = ['$resource',
  function($resource) {
    return $resource('/api/admin/reports/users', {}, {
      pageUserReports: {
        method: 'GET',
        isArray: true
      },
      pagePostReports: {
        method: 'GET',
        url: '/api/admin/reports/posts',
        isArray: true
      },
      pageMessageReports: {
        method: 'GET',
        url: '/api/admin/reports/messages',
        isArray: true
      },
      userReportsCount: {
        method: 'GET',
        url: '/api/admin/reports/users/count'
      },
      postReportsCount: {
        method: 'GET',
        url: '/api/admin/reports/posts/count'
      },
      messageReportsCount: {
        method: 'GET',
        url: '/api/admin/reports/messages/count'
      },
      pageUserReportsNotes: {
        method: 'GET',
        url: '/api/admin/reports/usernotes/:report_id',
        params: { report_id: '@report_id' },
        isArray: true,
        ignoreLoadingBar: true
      },
      pagePostReportsNotes: {
        method: 'GET',
        url: '/api/admin/reports/postnotes/:report_id',
        params: { report_id: '@report_id' },
        isArray: true,
        ignoreLoadingBar: true
      },
      pageMessageReportsNotes: {
        method: 'GET',
        url: '/api/admin/reports/messagenotes/:report_id',
        params: { report_id: '@report_id' },
        isArray: true,
        ignoreLoadingBar: true
      },
      userReportsNotesCount: {
        method: 'GET',
        url: '/api/admin/reports/usernotes/:report_id/count',
        params: { report_id: '@report_id' }
      },
      postReportsNotesCount: {
        method: 'GET',
        url: '/api/admin/reports/postnotes/:report_id/count',
        params: { report_id: '@report_id' }
      },
      messageReportsNotesCount: {
        method: 'GET',
        url: '/api/admin/reports/messagenotes/:report_id/count',
        params: { report_id: '@report_id' }
      },
      createUserReportNote: {
        method: 'POST',
        url: '/api/admin/reports/usernotes'
      },
      createPostReportNote: {
        method: 'POST',
        url: '/api/admin/reports/postnotes'
      },
      createMessageReportNote: {
        method: 'POST',
        url: '/api/admin/reports/messagenotes'
      },
      updateUserReportNote: {
        method: 'PUT',
        url: '/api/admin/reports/usernotes'
      },
      updatePostReportNote: {
        method: 'PUT',
        url: '/api/admin/reports/postnotes'
      },
      updateMessageReportNote: {
        method: 'PUT',
        url: '/api/admin/reports/messagenotes'
      },
      updateUserReport: {
        method: 'PUT',
        url: '/api/admin/reports/users'
      },
      updatePostReport: {
        method: 'PUT',
        url: '/api/admin/reports/posts'
      },
      updateMessageReport: {
        method: 'PUT',
        url: '/api/admin/reports/messages'
      }
    });
  }
];
