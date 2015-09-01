'use strict';
/* jslint node: true */

module.exports = ['$resource',
  function($resource) {
    return $resource('/api/reports/users', {}, {
      createUserReport: {
        method: 'POST'
      },
      createPostReport: {
        method: 'POST',
        url: '/api/reports/posts'
      },
      createMessageReport: {
        method: 'POST',
        url: '/api/reports/messages'
      }
    });
  }
];
