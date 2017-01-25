'use strict';
/* jslint node: true */

module.exports = ['$resource',
  function($resource) {
    return $resource('/api/invite', {}, {
      list: {
        method: 'GET',
        url: '/api/invites'
      },
      invite: {
        method: 'POST',
        url: '/api/invites'
      },
      resend: {
        method: 'POST',
        url: '/api/invites/resend'
      },
      remove: {
        method: 'POST',
        url: '/api/invites/remove'
      }
    });
  }
];
