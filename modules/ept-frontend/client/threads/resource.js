var resource = ['$resource',
  function($resource) {
    return $resource('/api/threads/:id', {}, {
      byBoard: {
        method: 'GET',
        url: '/api/threads'
      },
      recent: {
        method: 'GET',
        url: '/api/threads/recent'
      },
      posted: {
        method: 'GET',
        url: '/api/threads/posted'
      },
      title: {
        method: 'POST',
        params: { id: '@id' },
        url: '/api/threads/:id'
      },
      viewed: {
        method: 'POST',
        params: { id: '@id' },
        url: '/api/threads/:id/viewed'
      },
      lock: {
        method: 'POST',
        params: { id: '@id' },
        url: '/api/threads/:id/lock'
      },
      sticky: {
        method: 'POST',
        params: { id: '@id' },
        url: '/api/threads/:id/sticky'
      },
      move: {
        method: 'POST',
        params: { id: '@id' },
        url: '/api/threads/:id/move'
      },
      vote: {
        method: 'POST',
        params: { threadId: '@threadId', pollId: '@pollId' },
        url: '/api/threads/:threadId/polls/:pollId/vote'
      },
      removeVote: {
        method: 'DELETE',
        params: { threadId: '@threadId', pollId: '@pollId' },
        url: '/api/threads/:threadId/polls/:pollId/vote'
      },
      createPoll: {
        method: 'POST',
        params: { threadId: '@threadId', pollId: '@pollId' },
        url: '/api/threads/:threadId/polls'
      },
      editPoll: {
        method: 'PUT',
        params: { threadId: '@threadId', pollId: '@pollId' },
        url: '/api/threads/:threadId/polls/:pollId'
      },
      lockPoll: {
        method: 'POST',
        params: { threadId: '@threadId', pollId: '@pollId' },
        url: '/api/threads/:threadId/polls/:pollId/lock'
      },
      editCoOwners: {
        method: 'PUT',
        params: { threadId: '@threadId' },
        url: '/api/threads/:threadId/coOwners'
      }
    });
  }
];

angular.module('ept').factory('Threads', resource);
