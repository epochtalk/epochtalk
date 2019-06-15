var resource = ['$resource',
  function($resource) {
    return $resource('/api/users/:id', {}, {
      adminRecoverAccount: {
        method: 'POST',
        url: '/api/admin/recover'
      }
    });
  }
];


angular.module('ept').factory('Authorization', resource);
