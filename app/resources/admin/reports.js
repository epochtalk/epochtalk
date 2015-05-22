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
      }
    });
  }
];
