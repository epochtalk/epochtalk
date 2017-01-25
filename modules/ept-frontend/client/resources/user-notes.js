'use strict';
/* jslint node: true */

module.exports = ['$resource',
  function($resource) {
    return $resource('/api/user/notes', {}, {
      find: {
        method: 'GET',
        params: { id: '@id' },
        url: '/api/user/notes/:id',
        ignoreLoadingBar: true
      },
      page: {
        method: 'GET',
        ignoreLoadingBar: true
      },
      create: { method: 'POST' },
      update: { method: 'PUT' },
      delete: { method: 'DELETE' }
    });
  }
];
