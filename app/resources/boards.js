'use strict';
/* jslint node: true */

module.exports = ['$resource',
  function($resource) {
    return $resource('/api/boards/:id', {}, {
      query: {
        method: 'GET',
        url: '/api/boards'
      },
      byCategory: {
        method: 'GET',
        url: '/api/categoryboards'
      },
      update: {
        method: 'POST',
        params: { id: '@id' }
      }
    });
  }
];
