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
        params: {
          field: '@field',
          desc: '@desc',
          limit: '@limit',
          page: '@page'
        },
        url: '/api/admin/users',
        isArray: true
      },
      pageAdmins: {
        method: 'GET',
        params: {
          field: '@field',
          desc: '@desc',
          limit: '@limit',
          page: '@page'
        },
        url: '/api/admin/users/admins',
        isArray: true
      },
      pageModerators: {
        method: 'GET',
        params: {
          field: '@field',
          desc: '@desc',
          limit: '@limit',
          page: '@page'
        },
        url: '/api/admin/users/moderators',
        isArray: true
      }
    });
  }
];
