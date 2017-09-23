var resource = ['$resource',
  function($resource) {
    return $resource('/api/threadnotifications', {}, {
      getNotificationSettings: { method: 'GET' }
      enableNotifications: { method: 'PUT' },
      removeSubscriptions: { method: 'DELETE' }
    });
  }
];

angular.module('ept').factory('ThreadNotifications', resource);

