'use strict';
/* jslint node: true */

module.exports = ['$resource',
  function($resource) {
    return $resource('/api/admin/moderators', {}, {
      add: {
        method: 'POST'
      },
      remove: {
        method: 'DELETE'
      }
    });
  }
];
