var resource = ['$resource',
  function($resource) {
    return $resource('/api/mentions', {}, {
      latest: {
        method: 'GET',
        isArray: true,
        params: {
          limit: '@limit'
        }
      }
    });
  }
];

angular.module('ept').factory('Mentions', resource);
