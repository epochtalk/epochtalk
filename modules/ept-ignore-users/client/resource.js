var resource = ['$resource',
  function($resource) {
    return $resource('/api/ignoreUsers', {}, {
      ignored: {
        method: 'GET',
        params: {
          limit: '@limit',
          page: '@page'
        },
        url: '/api/ignoreUsers/ignored',
        ignoreLoadingBar: true
      },
      ignore: {
        method: 'POST',
        url: '/api/ignoreUsers/ignore/:id',
        params: { id: '@id' }
      },
      unignore: {
        method: 'POST',
        url: '/api/ignoreUsers/unignore/:id',
        params: { id: '@id' }
      }
    });
  }
];

angular.module('ept').factory('IgnoreUsers', resource);
