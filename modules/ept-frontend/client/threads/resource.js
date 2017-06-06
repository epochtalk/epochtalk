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
        params: { thread_id: '@thread_id', poll_id: '@poll_id' },
        url: '/api/threads/:thread_id/polls/:poll_id/vote'
      },
      removeVote: {
        method: 'DELETE',
        params: { thread_id: '@thread_id', poll_id: '@poll_id' },
        url: '/api/threads/:thread_id/polls/:poll_id/vote'
      },
      createPoll: {
        method: 'POST',
        params: { thread_id: '@thread_id', poll_id: '@poll_id' },
        url: '/api/threads/:thread_id/polls'
      },
      editPoll: {
        method: 'PUT',
        params: { thread_id: '@thread_id', poll_id: '@poll_id' },
        url: '/api/threads/:thread_id/polls/:poll_id'
      },
      lockPoll: {
        method: 'POST',
        params: { thread_id: '@thread_id', poll_id: '@poll_id' },
        url: '/api/threads/:thread_id/polls/:poll_id/lock'
      }
    });
  }
];

angular.module('ept').factory('Threads', resource);
