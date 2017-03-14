var resource = ['$resource',
  function($resource) {
    return $resource('/api/mentions', {}, {
      page: {
        method: 'GET',
        params: {
          limit: '@limit',
          page: '@page'
        },
        ignoreLoadingBar: true
      },
      delete: {
        method: 'DELETE',
        params: {
          page: '@id'
        },
        ignoreLoadingBar: true
      }
    });
  }
];

angular.module('ept').factory('Mentions', resource);
