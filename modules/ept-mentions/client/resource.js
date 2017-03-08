var resource = ['$resource',
  function($resource) {
    return $resource('/api/mentions', {}, {
      page: {
        method: 'GET',
        params: {
          limit: '@limit',
          page: '@page'
        }
      }
    });
  }
];

angular.module('ept').factory('Mentions', resource);
