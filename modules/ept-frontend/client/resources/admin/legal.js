'use strict';
/* jslint node: true */

module.exports = ['$resource',
  function($resource) {
    return $resource('/api/admin/legal', {}, {
      text: {
        method: 'GET',
        url: '/api/admin/legal',
      },
      update: {
        method: 'PUT',
        url: '/api/admin/legal',
      },
      reset: {
        method: 'POST',
        url: '/api/admin/legal/reset'
      }
    });
  }
];
