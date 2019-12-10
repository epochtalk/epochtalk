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
      pageStartedByUser: {
        url: '/api/posts/user/:username/started',
        method: 'GET',
        params: { username: '@username' }
      },
      search: {
        url: '/api/search/posts',
        method: 'GET'
      },
      delete: {
        url: '/api/posts/:id',
        method: 'DELETE',
        params: { id: '@id', locked: '@locked' }
      },
      undelete: {
        url: '/api/posts/:id/undelete',
        method: 'POST',
        params: { id: '@id' }
      },
      lock: {
        url: '/api/posts/:id/lock',
        method: 'POST',
        params: { id: '@id' }
      },
      unlock: {
        url: '/api/posts/:id/unlock',
        method: 'POST',
        params: { id: '@id' }
      },
      purge: {
        url: '/api/posts/:id/purge',
        method: 'DELETE',
        params: { id: '@id' }
      },
      patrolPosts: {
        method: 'GET',
        url: '/api/posts/patrol'
      }
    });
  }
];

angular.module('ept').factory('Posts', resource);
