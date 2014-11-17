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
      resetPassword: {
        method: 'POST',
        url: '/api/reset'
      },
      confirmAccount: {
        method: 'POST',
        url: '/api/confirm'
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
      checkResetToken: {
        method: 'GET',
        url: '/api/reset/:username/:token/validate',
        params: { username: '@username', token: '@token' }
      },
      recoverAccount: {
        method: 'GET',
        url: '/api/recover/:query',
        params: { query: '@query' }
      }
    });
  }
];
