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
      }
    });
  }
];
