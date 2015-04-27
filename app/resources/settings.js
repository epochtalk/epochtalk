'use strict';
/* jslint node: true */

module.exports = ['$resource',
  function($resource) {
    return $resource('/api/admin/settings/:name', {}, {
      all: {
        method: 'GET',
        url: '/api/admin/settings/all'
      },
      update: {
        method: 'POST',
        url: '/api/admin/settings'
      }
    });
  }
];
