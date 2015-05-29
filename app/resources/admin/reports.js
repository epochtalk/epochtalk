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
      userReportsCount: {
        method: 'GET',
        url: '/api/admin/reports/users/count'
      },
      postReportsCount: {
        method: 'GET',
        url: '/api/admin/reports/users/count'
      },
      pageUserReportsNotes: {
        method: 'GET',
        url: '/api/admin/reports/usernotes/:report_id',
        params: { report_id: '@report_id' },
        isArray: true
      },
      pagePostReportsNotes: {
        method: 'GET',
        url: '/api/admin/reports/postnotes/:report_id',
        params: { report_id: '@report_id' },
        isArray: true
      },
      userReportsNotesCount: {
        method: 'GET',
        url: '/api/admin/reports/usernotes/:report_id/count',
        params: { report_id: '@report_id' }
      },
      postReportsNotesCount: {
        method: 'GET',
        url: '/api/admin/reports/usernotes/:report_id/count',
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
      updateUserReportNote: {
        method: 'PUT',
        url: '/api/admin/reports/usernotes'
      },
      updatePostReportNote: {
        method: 'PUT',
        url: '/api/admin/reports/postnotes'
      },
      updateUserReport: {
        method: 'PUT',
        url: '/api/admin/reports/users'
      },
      updatePostReport: {
        method: 'PUT',
        url: '/api/admin/reports/posts'
      }
    });
  }
];
