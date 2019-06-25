var resource = ['$resource',
  function($resource) {
    return $resource('/api/invite', {}, {
      all: {
        method: 'GET',
        url: '/api/invites'
      },
      invite: {
        method: 'POST',
        url: '/api/invites'
      },
      hasInvitation: {
        method: 'GET',
        params: { email: '@email' },
        url: '/api/invites/exists'
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

angular.module('ept').factory('Invitations', resource);
