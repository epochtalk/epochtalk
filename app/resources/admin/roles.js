'use strict';
/* jslint node: true */

module.exports = ['$resource',
  function($resource) {
    return $resource('/api/admin/roles/all', {}, {
      all: {
        method: 'GET',
        isArray: true
      },
      remove: {
        method: 'DELETE',
        url: '/api/admin/roles/remove/:id',
        params: { id: '@id' }
      },
      reprioritize: {
        method: 'PUT',
        url: '/api/admin/roles/reprioritize'
      },
      update: {
        method: 'PUT',
        url: '/api/admin/roles/update'
      },
      ban: {
        method: 'POST',
        url: '/api/admin/roles/add'
      }
    });
  }
];
