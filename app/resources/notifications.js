'use strict';
/* jslint node: true */

module.exports = ['$resource',
  function($resource) {
    return $resource('/api/notifications/:id', {}, {
      counts: {
        method: 'GET',
        url: '/api/notifications/counts'
      }
    });
  }
];
