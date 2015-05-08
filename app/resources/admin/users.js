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
      searchUsernames: {
        method: 'GET',
        url: '/api/admin/users/search',
        isArray: true
      },
      countAdmins: {
        method: 'GET',
        url: '/api/admin/users/admins/count'
      },
      countModerators: {
        method: 'GET',
        url: '/api/admin/users/moderators/count'
      },
      page: {
        method: 'GET',
        url: '/api/admin/users',
        isArray: true
      },
      pageAdmins: {
        method: 'GET',
        url: '/api/admin/users/admins',
        isArray: true
      },
      pageModerators: {
        method: 'GET',
        url: '/api/admin/users/moderators',
        isArray: true
      }
    });
  }
];
