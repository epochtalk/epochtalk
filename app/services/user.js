'use strict';

module.exports = ['$resource',
  function($resource) {
    return $resource('/api/users/:id/', {}, {
      update: {
        method: 'PUT'
      },
      register: {
        method: 'POST',
        url: '/api/users/register'
      },
      login: {
        method: 'POST',
        url: '/api/users/login'
      },
      logout: {
        method: 'DELETE',
        url: '/api/users/logout'
      }
    });
  }
];
