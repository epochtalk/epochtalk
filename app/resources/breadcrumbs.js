'use strict';
/* jslint node: true */

module.exports = ['$resource',
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
