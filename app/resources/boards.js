'use strict';
/* jslint node: true */

module.exports = ['$resource',
  function($resource) {
    return $resource('/api/boards/:id', {}, {
      update: {
        method: 'POST',
        params: { id: '@id' }
      }
    });
  }
];
