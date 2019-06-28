var resource = ['$resource',
  function($resource) {
    return $resource('/api/configurations', {}, {
      get: { method: 'GET' },
      update: { method: 'POST' }
    });
  }
];

angular.module('ept').factory('Configurations', resource);
