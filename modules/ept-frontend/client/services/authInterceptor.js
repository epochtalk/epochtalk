module.exports = ['$q', 'Session',
  function ($q, Session) {
  return {
    request: function (config) {
      config.headers = config.headers || {};
      var token = Session.getToken();
      if (token) { config.headers.Authorization = 'Bearer ' + token; }
      return config;
    },
    responseError: function(rejection) {
      if (rejection.status === 401) { Session.clearUser(); }
      return $q.reject(rejection);
    }
  };
}];
