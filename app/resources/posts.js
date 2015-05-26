'use strict';
/* jslint node: true */

module.exports = ['$resource',
  function($resource) {
    return $resource('/api/posts/:id', {}, {
      byThread: {
        method: 'GET',
        params: {
          thread_id: '@thread_id',
          limit: '@limit',
          page: '@page'
        },
        url: '/api/posts',
        isArray: true
      },
      update: {
        method: 'POST',
        params: { id: '@id' }
      },
      pageByUser: {
        url: '/api/posts/user/:username',
        method: 'GET',
        params: { username: '@username' },
        isArray: true,
      },
      pageByUserCount: {
        url: '/api/posts/user/:username/count',
        params: { username: '@username' },
        method: 'GET',
      }
    });
  }
];
