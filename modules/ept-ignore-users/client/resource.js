var resource = ['$resource',
  function($resource) {
    return $resource('/api/ignoreUsers', {}, {
      ignored: {
        method: 'GET',
        params: {
          limit: '@limit',
          page: '@page'
        },
        url: '/api/ignoreUsers/ignored'
      },
      ignore: {
        method: 'POST',
        url: '/api/ignoreUsers/ignore/:userId',
        params: { userId: '@userId' }
      },
      unignore: {
        method: 'POST',
        url: '/api/ignoreUsers/unignore/:userId',
        params: { userId: '@userId' }
      }
    });
  }
];

angular.module('ept').factory('IgnoreUsers', resource);
