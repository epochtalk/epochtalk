module.exports = ['$resource',
  function($resource) {
    return $resource('/api/reports', {}, {
      // Posts
      createPostReport: {
        method: 'POST',
        url: '/api/reports/posts'
      },
      pagePostReports: {
        method: 'GET',
        url: '/api/reports/posts'
      },
      updatePostReport: {
        method: 'PUT',
        url: '/api/reports/posts'
      },
      createPostReportNote: {
        method: 'POST',
        url: '/api/reports/postnotes'
      },
      pagePostReportsNotes: {
        method: 'GET',
        url: '/api/reports/postnotes/:report_id',
        params: { report_id: '@report_id' }
      },
      updatePostReportNote: {
        method: 'PUT',
        url: '/api/reports/postnotes'
      },
      // Users
      createUserReport: {
        method: 'POST',
        url: '/api/reports/users'
      },
      pageUserReports: {
        method: 'GET',
        url: '/api/reports/users'
      },
      updateUserReport: {
        method: 'PUT',
        url: '/api/reports/users'
      },
      createUserReportNote: {
        method: 'POST',
        url: '/api/reports/usernotes'
      },
      pageUserReportsNotes: {
        method: 'GET',
        url: '/api/reports/usernotes/:report_id',
        params: { report_id: '@report_id' }
      },
      updateUserReportNote: {
        method: 'PUT',
        url: '/api/reports/usernotes'
      },
      // Messages
      createMessageReport: {
        method: 'POST',
        url: '/api/reports/messages'
      },
      pageMessageReports: {
        method: 'GET',
        url: '/api/reports/messages'
      },
      updateMessageReport: {
        method: 'PUT',
        url: '/api/reports/messages'
      },
      createMessageReportNote: {
        method: 'POST',
        url: '/api/reports/messagenotes'
      },
      pageMessageReportsNotes: {
        method: 'GET',
        url: '/api/reports/messagenotes/:report_id',
        params: { report_id: '@report_id' }
      },
      updateMessageReportNote: {
        method: 'PUT',
        url: '/api/reports/messagenotes'
      }
    });
  }
];
