var resource = ['$resource',
  function($resource) {
    return $resource('/api/admin/blacklist', {}, {
      getBlacklist: {
        method: 'GET',
        isArray: true
      },
      addToBlacklist: {
        method: 'POST',
        isArray: true
      },
      updateBlacklist: {
        method: 'PUT',
        isArray: true
      },
      deleteFromBlacklist: {
        method: 'DELETE',
        url: '/api/admin/blacklist/:id',
        params: { id: '@id' },
        isArray: true
      }
    });
  }
];

angular.module('ept').factory('Blacklist', resource);
