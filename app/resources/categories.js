'use strict';
/* jslint node: true */

module.exports = ['$resource',
  function($resource) {
    return $resource('/api/categories/:id', {}, {
      all: {
        method: 'GET',
        url: '/api/boards',
        isArray: true
      }
    });
  }
];
