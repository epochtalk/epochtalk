'use strict';
/* jslint node: true */

module.exports = ['$resource',
  function($resource) {
    return $resource('/api/boards/:id', {}, {
      query: {
        method: 'GET',
        url: '/api/boards'
      },
      update: { method: 'PUT', isArray: true }
    });
  }
];
