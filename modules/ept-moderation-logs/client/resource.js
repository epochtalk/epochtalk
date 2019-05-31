var resource = ['$resource',
  function($resource) {
    return $resource('/api/admin/modlog', {}, {
      page: {
        method: 'GET'
      }
    });
  }
];

angular.module('ept').factory('ModerationLogs', resource);
