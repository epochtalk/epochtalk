var resource = ['$resource',
  function($resource) {
    return $resource('/api/legal', {}, {
      text: { method: 'GET' },
      update: { method: 'PUT' },
      reset: {
        method: 'POST',
        url: '/api/legal/reset'
      }
    });
  }
];

angular.module('ept').factory('Legal', resource);
