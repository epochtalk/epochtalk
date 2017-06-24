var conversationsResource = ['$resource',
  function($resource) {
    return $resource('/api/conversations/:id', {}, {
      messages: {
        method: 'GET',
        url: '/api/conversations/:id',
        params: {
          id: '@id',
          limit: '@limit',
          timestamp: '@timestamp',
          message_id: '@message_id'
        }
      }
    });
  }
];

var messagesResource = ['$resource',
  function($resource) {
    return $resource('/api/messages/:id', {}, {
      latest: {
        method: 'GET',
        url: '/api/messages',
        params: {
          limit: '@limit',
          page: '@page'
        }
      },
      findUser: {
        method: 'GET',
        url: '/api/messages/users/:username',
        params: { username: '@username' },
        isArray: true,
        ignoreLoadingBar: true
      }
    });
  }
];

angular.module('ept')
.factory('Conversations', conversationsResource)
.factory('Messages', messagesResource);
