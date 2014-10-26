'use strict';
/* jslint node: true */

module.exports = ['$q', '$window', function ($q, $window) {
  return {
    request: function (config) {
      config.headers = config.headers || {};
      var token;
      if($window.sessionStorage.token) {
        token = $window.sessionStorage.token;
      }
      else if ($window.localStorage.token) {
        token = $window.localStorage.token;
      }

      if (token) {
        config.headers.Authorization = 'Bearer ' + token;
      }
      return config;
    },
    response: function (response) {
      if (response.status === 401 ||
          response.headers('Authorization') === 'Revoked') {
        // handle the case where the user is not authenticated
        delete $window.sessionStorage.token;
        delete $window.sessionStorage.username;
        delete $window.sessionStorage.userId;
        delete $window.localStorage.token;
        delete $window.localStorage.username;
        delete $window.localStorage.userId;
      }
      return response || $q.when(response);
    }
  };
}];