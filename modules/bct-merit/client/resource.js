var resource = ['$resource',
  function($resource) {
    return $resource('/api/merit', {}, {
      send: { method: 'PUT' },
      insertSource: {
        method: 'POST',
        url: '/api/merit/sources'
      },
      getUserStatistics: {
        method: 'GET',
        url: '/api/merit/:userId',
        params: { userId: '@userId' }
      },
      getStatistics: {
        method: 'GET',
        url: '/api/merit/'
      },
      getLatestSourceRecords: {
        method: 'GET',
        url: '/api/merit/sources',
        isArray: true
      }
    });
  }
];

angular.module('ept').factory('Merit', resource);
