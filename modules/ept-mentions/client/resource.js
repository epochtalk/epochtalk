var resource = ['$resource',
  function($resource) {
    return $resource('/api/mentions', {}, {
      page: {
        method: 'GET',
        params: {
          limit: '@limit',
          page: '@page'
        },
        ignoreLoadingBar: true
      },
      delete: {
        method: 'DELETE',
        params: {
          page: '@id'
        },
        ignoreLoadingBar: true
      },
      getUserIgnored: {
        method: 'GET',
        url: '/api/mentions/ignored',
        params: {
          limit: '@username',
        },
        ignoreLoadingBar: true
      },
      getIgnoredUsers: {
        method: 'GET',
        url: '/api/mentions/ignored/all',
        ignoreLoadingBar: true,
        isArray: true
      },
      ignoreUser: {
        method: 'POST',
        url: '/api/mentions/ignore',
        params: {
          limit: '@username',
        },
        ignoreLoadingBar: true
      },
      unignoreUser: {
        method: 'POST',
        url: '/api/mentions/unignore',
        params: {
          limit: '@username',
        },
        ignoreLoadingBar: true
      }
    });
  }
];

angular.module('ept').factory('Mentions', resource);
