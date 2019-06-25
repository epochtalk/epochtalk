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
      }
    });
  }
];

angular.module('ept')
.factory('Conversations', conversationsResource)
.factory('Messages', messagesResource);
