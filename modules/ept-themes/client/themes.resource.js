var resource = ['$resource',
  function($resource) {
    return $resource('/api/theme/', {}, {
      getTheme: { method: 'GET' },
      setTheme: { method: 'PUT' },
      resetTheme: { method: 'POST' },
      previewTheme: {
        method: 'PUT',
        url: '/api/theme/preview'
      }
    });
  }
];

angular.module('ept').factory('Themes', resource);
