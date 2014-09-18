'use strict';
/* jslint node: true */

module.exports = ['$rootScope', '$q', '$window', function ($rootScope, $q, $window) {
  return {
    request: function (config) {
      config.headers = config.headers || {};
      
      if ($window.localStorage.epochViewToken) {
        var viewToken = $window.localStorage.epochViewToken;
        config.headers['Epoch-Viewer'] = viewToken;
      }

      return config;
    },
    response: function (response) {
      var viewToken = response.headers('Epoch-Viewer');
      if (viewToken) { $window.localStorage.epochViewToken = viewToken; }
      return response || $q.when(response);
    }
  };
}];