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
        params: {
          id: '@id',
          title: '@title',
          body: '@body',
          encodedBody: '@encodedBody',
          thread_id: '@thread_id'
        }
      }
    });
  }
];
