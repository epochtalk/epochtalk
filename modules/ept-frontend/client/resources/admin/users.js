'use strict';
/* jslint node: true */

module.exports = ['$resource',
  function($resource) {
    return $resource('/api/admin/users/:username/', {}, {
      addRoles: {
        method: 'PUT',
        url: '/api/admin/users/roles/add',
        isArray: true
      },
      removeRoles: {
        method: 'PUT',
        url: '/api/admin/users/roles/remove'
      },
      count: {
        method: 'GET',
        url: '/api/admin/users/count',
        ignoreLoadingBar: true
      },
      searchUsernames: {
        method: 'GET',
        url: '/api/admin/users/search',
        isArray: true,
        ignoreLoadingBar: true
      },
      page: {
        method: 'GET',
        url: '/api/admin/users',
        isArray: true
      }
    });
  }
];
