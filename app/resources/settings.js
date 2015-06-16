'use strict';
/* jslint node: true */

module.exports = ['$resource',
  function($resource) {
    return $resource('/api/settings', {}, {
      webConfigs: {
        url: '/api/settings/web',
        method: 'GET'
      }
    });
  }
];
