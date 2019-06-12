var resource = ['$resource',
  function($resource) {
    return $resource('/api/notifications/', {}, {
      dismiss: {
        params: { type: '@type' },
        method: 'POST',
        url: '/api/notifications/dismiss'
      },
      counts: {
        method: 'GET',
        url: '/api/notifications/counts'
      }
    });
  }
];

angular.module('ept').factory('Notifications', resource);
