'use strict';
/* jslint node: true */

module.exports = ['$q', '$window', 'Session',
  function ($q, $window, Session) {
  return {
    request: function (config) {
      config.headers = config.headers || {};
      var token = Session.getToken();
      if (token) { config.headers.Authorization = 'Bearer ' + token; }
      return config;
    },
    response: function (response) {
      if (response.status === 401 ||
          response.headers('Authorization') === 'Revoked') {
        Session.clearUser();
      }
      return response || $q.when(response);
    }
  };
}];
