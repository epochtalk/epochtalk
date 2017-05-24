var resource = ['$resource',
  function($resource) {
    return $resource('/api/portal', {}, {
      query: {
        method: 'GET',
        url: '/api/portal'
      }
    });
  }
];

angular.module('ept').factory('Portal', resource);
