'use strict';
/* jslint node: true */

module.exports = ['$resource',
  function($resource) {
    return $resource('/api/watchlist/:threadId', {}, {
      index: {
        method: 'GET',
        url: '/api/watchlist'
      },
      all: {
        method: 'GET',
        url: '/api/watchlist/all'
      },
      unread: {
        method: 'GET',
        url: '/api/watchlist/unread'
      },
      edit: {
        method: 'GET',
        url: '/api/watchlist/edit'
      },
      pageThreads: {
        method: 'GET',
        url: '/api/watchlist/threads'
      },
      pageBoards: {
        method: 'GET',
        url: '/api/watchlist/boards'
      },
      watchThread: {
        method: 'POST',
        params: { threadId: '@threadId' },
        url: '/api/watchlist/threads/:threadId'
      },
      watchBoard: {
        method: 'POST',
        params: { boardId: '@boardId' },
        url: '/api/watchlist/boards/:boardId'
      },
      unwatchThread: {
        method: 'DELETE',
        params: { threadId: '@threadId' },
        url: '/api/watchlist/threads/:threadId'
      },
      unwatchBoard: {
        method: 'DELETE',
        params: { boardId: '@boardId' },
        url: '/api/watchlist/boards/:boardId'
      }
    });
  }
];
