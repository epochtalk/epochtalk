var resource = ['$resource',
  function($resource) {
    return $resource('/api/rank', {}, {
      get: { method: 'GET', isArray: true },
      upsert: { method: 'PUT', isArray: true }
    });
  }
];

angular.module('ept').factory('Ranks', resource);
