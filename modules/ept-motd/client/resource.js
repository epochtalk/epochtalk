var resource = ['$resource',
  function($resource) {
    return $resource('/api/motd', {}, {
      get: {
        method: 'GET',
      },
      save: {
        method: 'PUT'
      }
    });
  }
];

angular.module('ept').factory('Motd', resource);
