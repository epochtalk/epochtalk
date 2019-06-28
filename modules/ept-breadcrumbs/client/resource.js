var resource = ['$resource',
  function($resource) {
    return $resource('/api/breadcrumbs', {}, {
      getBreadcrumbs: {
        method: 'GET',
        params: { id: '@id', type: '@type' },
        isArray: true
      }
    });
  }
];

angular.module('ept').factory('Breadcrumbs', resource);
