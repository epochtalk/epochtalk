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
      enableMessageEmails: {
        method: 'PUT',
        url: '/api/messages/settings'
      },
      getMessageEmailSettings: {
        method: 'GET',
        url: '/api/messages/settings'
      },
      pageIgnoredUsers: {
        method: 'GET',
        url: '/api/messages/ignored',
        ignoreLoadingBar: true,
      },
      ignoreUser: {
        method: 'POST',
        url: '/api/messages/ignore',
        params: {
          username: '@username',
        },
        ignoreLoadingBar: true
      },
      unignoreUser: {
        method: 'POST',
        url: '/api/messages/unignore',
        params: {
          username: '@username',
        },
        ignoreLoadingBar: true
      },
    });
  }
];

angular.module('ept')
.factory('Conversations', conversationsResource)
.factory('Messages', messagesResource);
