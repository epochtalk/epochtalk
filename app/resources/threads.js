'use strict';
/* jslint node: true */

module.exports = ['$resource',
  function($resource) {
    return $resource('/api/threads/:id', {}, {
      byBoard: {
        method: 'GET',
        params: {
          board_id: '@board_id',
          limit: '@limit',
          page: '@page'
        },
        url: '/api/threads'
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
