'use strict';
/* jslint node: true */

module.exports = ['$resource',
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
