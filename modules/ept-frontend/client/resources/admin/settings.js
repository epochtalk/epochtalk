'use strict';
/* jslint node: true */

module.exports = ['$resource',
  function($resource) {
    return $resource('/api/admin/settings/', {}, {
      getBlacklist: {
        method: 'GET',
        url: '/api/admin/settings/blacklist',
        isArray: true
      },
      addToBlacklist: {
        method: 'POST',
        url: '/api/admin/settings/blacklist',
        isArray: true
      },
      updateBlacklist: {
        method: 'PUT',
        url: '/api/admin/settings/blacklist',
        isArray: true
      },
      deleteFromBlacklist: {
        method: 'DELETE',
        url: '/api/admin/settings/blacklist/:id',
        params: { id: '@id' },
        isArray: true
      },
      getTheme: {
        method: 'GET',
        url: '/api/admin/settings/theme'
      },
      setTheme: {
        method: 'PUT',
        url: '/api/admin/settings/theme'
      },
      previewTheme: {
        method: 'PUT',
        url: '/api/admin/settings/theme/preview'
      },
      resetTheme: {
        method: 'POST',
        url: '/api/admin/settings/theme'
      }
    });
  }
];
