var resource = ['$resource',
  function($resource) {
    return $resource('/api/threadnotifications', {}, {
      enableNotifications: { method: 'PUT' },
      removeSubscriptions: { method: 'DELETE' }
    });
  }
];

angular.module('ept').factory('ThreadNotifications', resource);

