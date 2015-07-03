'use strict';
/* jslint node: true */
/* global angular */

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
        // get username and rememberMe
        var rememberMe = user.rememberMe;
        // Can't delete user.rememberMe without UI Flicker, copy user instead
        var userCopy = {};
        userCopy.username = user.username;
        userCopy.password = user.password;

        return User.login(userCopy).$promise
        .then(function(resource) {
          Session.setUser(resource, rememberMe);
        });
      },

      logout: function() {
        return User.logout().$promise
        .then(function() { Session.clearUser(); });
      },

      authenticate: function() {
        if (Session.getToken()) {
          User.ping().$promise
          .then(function(user) { Session.setUser(user); })
          .catch(function(err) { Session.clearUser(); });
        }
        else { Session.clearUser(); }
      }
    };

    serviceAPI.authenticate();
    return serviceAPI;
  }
];
