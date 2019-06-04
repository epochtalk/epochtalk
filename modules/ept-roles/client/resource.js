var resource = ['$resource',
  function($resource) {
    return $resource('/api/admin/roles/all', {}, {
      all: {
        method: 'GET'
      },
      users: {
        method: 'GET',
        url: '/api/admin/roles/:id/users',
        params: { id: '@id' }
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
      add: {
        method: 'POST',
        url: '/api/admin/roles/add'
      }
    });
  }
];

angular.module('ept').factory('Roles', resource);
