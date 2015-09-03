'use strict';
/* jslint node: true */

module.exports = ['$resource',
  function($resource) {
    return $resource('/api/threads/:id', {}, {
      byBoard: {
        method: 'GET',
        url: '/api/threads'
      },
      title: {
        method: 'POST',
        params: { id: '@id' },
        url: '/api/threads/:id'
      },
      viewed: {
        method: 'POST',
        params: { id: '@id' },
        url: '/api/threads/:id/viewed'
      },
      lock: {
        method: 'POST',
        params: { id: '@id' },
        url: '/api/threads/:id/lock'
      },
      sticky: {
        method: 'POST',
        params: { id: '@id' },
        url: '/api/threads/:id/sticky'
      },
      move: {
        method: 'POST',
        params: { id: '@id' },
        url: '/api/threads/:id/move'
      }
    });
  }
];
