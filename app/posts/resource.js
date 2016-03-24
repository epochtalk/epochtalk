var resource = ['$resource',
  function($resource) {
    return $resource('/api/posts/:id', {}, {
      byThread: {
        method: 'GET',
        params: {
          thread_id: '@thread_id',
          limit: '@limit',
          page: '@page'
        },
        url: '/api/posts'
      },
      update: {
        method: 'POST',
        params: { id: '@id' }
      },
      pageByUser: {
        url: '/api/posts/user/:username',
        method: 'GET',
        params: { username: '@username' }
      },
      undelete: {
        url: '/api/posts/:id/undelete',
        method: 'POST',
        params: { id: '@id' }
      },
      purge: {
        url: '/api/posts/:id/purge',
        method: 'DELETE',
        params: { id: '@id' }
      }
    });
  }
];

angular.module('ept').factory('Posts', resource);
