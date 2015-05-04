'use strict';
/* jslint node: true */

module.exports = ['$resource',
  function($resource) {
    return $resource('/api/admin/users/:username/', {}, {
      update: {
        method: 'PUT',
        url: '/api/admin/users'
      },
      count: {
        method: 'GET',
        url: '/api/admin/users/count'
      },
      page: {
        method: 'GET',
        params: {
          field: '@field',
          desc: '@desc',
          limit: '@limit',
          page: '@page'
        },
        url: '/api/admin/users',
        isArray: true
      },
    });
  }
];
