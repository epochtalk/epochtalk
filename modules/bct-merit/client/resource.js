var resource = ['$resource',
  function($resource) {
    return $resource('/api/merit', {}, {
      send: { method: 'PUT' }
    });
  }
];

angular.module('ept').factory('Merit', resource);
