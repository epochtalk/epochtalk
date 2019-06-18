'use strict';
/* jslint node: true */

module.exports = ['$resource',
  function($resource) {
    return $resource('/api/admin/boards', {}, {
      boards: {
        method: 'GET',
        isArray: true
      },
      moveBoards: {
        method: 'GET',
        url: '/api/admin/boards/move',
        isArray: true
      },
      updateCategories: {
        method: 'POST',
        url: '/api/admin/categories',
        isArray: true
      }
    });
  }
];
