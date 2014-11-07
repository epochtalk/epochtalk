'use strict';
/* jslint node: true */

module.exports = ['$resource',
  function($resource) {
    return $resource('/api/users/:id/', {}, {
      update: {
        method: 'PUT'
      },
      register: {
        method: 'POST',
        url: '/api/register'
      },
      login: {
        method: 'POST',
        url: '/api/login'
      },
      logout: {
        method: 'DELETE',
        url: '/api/logout'
      },
      ping: {
        method: 'GET',
        url: '/api/authenticated'
      },
      checkUsername: {
        method: 'GET',
        url: '/api/register/username/:username',
        params: { username: '@username' }
      },
      checkEmail: {
        method: 'GET',
        url: '/api/register/email/:email',
        params: { email: '@email' }
      },
      recoverEmail: {
        method: 'GET',
        url: '/api/users/recover/:query',
        params: { query: '@query' }
      }
    });
  }
];
