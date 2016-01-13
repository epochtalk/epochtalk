'use strict';
/* jslint node: true */

module.exports = ['$window', 'User', 'Session',
  function($window, User, Session) {
    // Service API
    var serviceAPI = {
      register: function(user) {
        return User.register(user).$promise
        .then(function(resource) {
          // Set user session if account is already confirmed (log the user in)
          if (!resource.confirm_token) { Session.setUser(resource); }
          return resource;
        });
      },

      login: function(user) {
        return User.login(user).$promise
        .then(function(resource) { Session.setUser(resource); });
      },

      logout: function() {
        return User.logout().$promise
        .then(function() { Session.clearUser(); });
      },

      authenticate: function() {
        if (Session.getToken()) {
          User.ping().$promise
          .then(function(user) { Session.setUser(user); });
        }
        else { Session.clearUser(); }
      }
    };

    serviceAPI.authenticate();
    return serviceAPI;
  }
];
