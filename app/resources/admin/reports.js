'use strict';
/* jslint node: true */

module.exports = ['$resource',
  function($resource) {
    return $resource('/api/admin/reports/users', {}, {
      pageUserReports: {
        method: 'GET'
      },
      pagePostReports: {
        method: 'GET',
        url: '/api/admin/reports/posts'
      },
      pageMessageReports: {
        method: 'GET',
        url: '/api/admin/reports/messages'
      },
      pageUserReportsNotes: {
        method: 'GET',
        url: '/api/admin/reports/usernotes/:report_id',
        params: { report_id: '@report_id' }
      },
      pagePostReportsNotes: {
        method: 'GET',
        url: '/api/admin/reports/postnotes/:report_id',
        params: { report_id: '@report_id' }
      },
      pageMessageReportsNotes: {
        method: 'GET',
        url: '/api/admin/reports/messagenotes/:report_id',
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
