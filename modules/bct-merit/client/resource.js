var resource = ['$resource',
  function($resource) {
    return $resource('/api/merit', {}, {
      send: { method: 'PUT' },
      getUserStatistics: {
        method: 'GET',
        url: '/api/merit/:userId',
        params: { userId: '@userId' }
      },
      getStatistics: {
        method: 'GET',
        url: '/api/merit/'
      }
    });
  }
];

angular.module('ept').factory('Merit', resource);
