var resource = ['$resource',
  function($resource) {
    return $resource('/api/plugins/altcoins', {}, {
      allProjects: {
        method: 'GET',
        url: '/api/plugins/altcoins/projects/all',
        isArray: true
      }
    });
  }
];

angular.module('ept').factory('Altcoins', resource);
