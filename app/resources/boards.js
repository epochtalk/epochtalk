'use strict';
/* jslint node: true */

module.exports = ['$resource',
  function($resource) {
    return $resource('/api/boards/:id', {}, {
      all: {
        method: 'GET',
        url: '/api/boards/all',
        isArray: true
      },
      query: {
        method: 'GET',
        url: '/api/boards'
      },
      update: {
        method: 'POST',
        params: { id: '@id' }
      }
    });
  }
];
