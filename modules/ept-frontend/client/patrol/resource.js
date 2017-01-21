var resource = ['$resource',
  function($resource) {
    return $resource('/api/patrol', {}, {
      index: {
        method: 'GET',
        url: '/api/patrol'
      }
    });
  }
];

angular.module('ept').factory('Patrol', resource);
