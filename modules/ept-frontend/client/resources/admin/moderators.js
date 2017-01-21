'use strict';
/* jslint node: true */

module.exports = ['$resource',
  function($resource) {
    return $resource('/api/admin/moderators', {}, {
      add: {
        method: 'POST',
        isArray: true
      },
      remove: {
        url: '/api/admin/moderators/remove',
        method: 'POST',
        isArray: true
      }
    });
  }
];
