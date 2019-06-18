var resource = ['$resource',
  function($resource) {
    return $resource('/api/boards/:id', {}, {
      query: {
        method: 'GET',
        url: '/api/boards'
      },
      update: { method: 'PUT', isArray: true },
      save: { method: 'POST', isArray: true },
      delete: { method: 'POST', url: '/api/boards/delete', isArray: true },
      unfiltered: {
        method: 'GET',
        url: '/api/boards/unfiltered',
        isArray: true
      },
      uncategorized: {
        method: 'GET',
        url: '/api/boards/uncategorized',
        isArray: true
      },
    });
  }
];

angular.module('ept').factory('Boards', resource);
