'use strict';
/* jslint node: true */

module.exports = ['$resource',
  function($resource) {
    return $resource('/api/conversations/:id', {}, {
      messages: {
        method: 'GET',
        url: '/api/conversations/:id',
        params: {
          id: '@id',
          limit: '@limit',
          timestamp: '@timestamp',
          message_id: '@message_id'
        }
      }
    });
  }
];
