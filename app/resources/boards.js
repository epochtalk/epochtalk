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
      update: {
        method: 'POST',
        params: { id: '@id' }
      },
      updateCategories: {
        method: 'POST',
        params: { categories: '@categories' },
        url: '/api/boards/categories',
        isArray: true
      }
    });
  }
];
